import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { storage } from "./storage";
import { ragService } from "./services/rag";
import { pdfProcessor } from "./services/pdf";
import { uploadToS3, getPresignedUrl } from "./services/s3";
import { getProductLibrary } from "./services/vectorSearch";
import { insertDocumentSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";

// Simple in-memory rate limiter: 20 messages per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function chatRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const limit = 5;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }
  if (entry.count >= limit) {
    return res.status(429).json({ error: "Rate limit exceeded. Maximum 5 messages per minute." });
  }
  entry.count++;
  next();
}

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

// Use memory storage so we can stream the buffer directly to S3
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {

  // ── Catalog endpoints ────────────────────────────────────────────────────────

  // GET /api/catalog — all 1,249 product sheets from document_chunks (with optional ?q= filter)
  app.get("/api/catalog", async (req, res) => {
    try {
      const products = await getProductLibrary();
      const q = (req.query.q as string | undefined)?.toLowerCase();
      const result = q
        ? products.filter(
            (p) =>
              p.product_name.toLowerCase().includes(q) ||
              p.manufacturer.toLowerCase().includes(q) ||
              p.product_category.toLowerCase().includes(q)
          )
        : products;
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // GET /api/catalog/pdf?key=raw-docs/... — presigned URL for product PDF (MUST be before /:id)
  app.get("/api/catalog/pdf", async (req, res) => {
    try {
      const key = req.query.key as string;
      if (!key) return res.status(400).json({ error: "key param required" });
      const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      res.json({ url, expiresIn: 3600 });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // GET /api/catalog/:id — single product (MUST be after /pdf)
  app.get("/api/catalog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const products = await getProductLibrary();
      const product = products.find((p) => p.id === id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get all documents (assembly letters)
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Search product data (MUST come before /api/products/:id)
  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const products = await storage.searchProductData(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get all product data (product sheets from zip file)
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProductData();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get a specific product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const products = await storage.getProductData();
      const product = products.find(p => p.id === id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get a specific document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Generate a pre-signed S3 download URL for an uploaded document
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const meta = document.metadata as Record<string, any>;
      if (!meta?.s3Key) {
        return res.status(400).json({ error: "Document is not hosted on S3" });
      }

      const url = await getPresignedUrl(meta.s3Key, 3600);
      res.json({ url, expiresIn: 3600 });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Serve PDF files directly (pre-loaded local product sheets)
  app.get("/api/documents/pdf/:filename", async (req, res) => {
    try {
      const filename = decodeURIComponent(req.params.filename);
      // Use process.cwd() to get the correct root directory
      const pdfPath = path.join(process.cwd(), 'attached_assets/extracted_products', filename);
      
      console.log(`Attempting to serve PDF: ${pdfPath}`);
      
      // Check if file exists
      if (!fs.existsSync(pdfPath)) {
        console.log(`PDF file not found: ${pdfPath}`);
        return res.status(404).json({ error: `PDF file not found: ${filename}` });
      }
      
      // Set appropriate headers for PDF viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      
      // Stream the PDF file
      const stream = fs.createReadStream(pdfPath);
      stream.on('error', (err) => {
        console.error('Error streaming PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error reading PDF file' });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error('PDF serving error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Upload PDF documents
  app.post("/api/documents/upload", upload.array('files'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedDocuments = [];

      for (const file of files) {
        try {
          // Extract text from buffer (no local disk needed)
          const pdfResult = await pdfProcessor.extractTextFromBuffer(file.buffer, file.originalname);

          // Upload original PDF to S3
          const s3Key = `product-sheets/${nanoid()}-${file.originalname.replace(/\s+/g, '_')}`;
          await uploadToS3(file.buffer, s3Key, 'application/pdf');

          // Store document with s3Key in metadata
          const documentData = {
            filename: s3Key,
            originalName: file.originalname,
            content: pdfResult.text,
            metadata: { ...pdfResult.metadata, s3Key }
          };

          const validation = insertDocumentSchema.safeParse(documentData);
          if (!validation.success) {
            throw new Error(`Validation error: ${validation.error.message}`);
          }

          const document = await storage.createDocument(validation.data);
          uploadedDocuments.push(document);
        } catch (error) {
          console.error(`Failed to process file ${file.originalname}:`, error);
          // Continue with other files
        }
      }

      res.json({ 
        message: `Successfully uploaded ${uploadedDocuments.length} documents`,
        documents: uploadedDocuments 
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Search documents
  app.get("/api/documents/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const documents = await storage.searchDocuments(query);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get chat sessions
  app.get("/api/chat/sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Create new chat session
  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Session title is required" });
      }

      const validation = insertChatSessionSchema.safeParse({ title });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const session = await storage.createChatSession(validation.data);
      console.log(`[SESSION LOG] ${new Date().toISOString()} - New chat session created: "${title}" (ID: ${session.id})`);
      
      res.json(session);
    } catch (error) {
      console.error(`[SESSION ERROR] ${new Date().toISOString()} - Error creating session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get specific chat session
  app.get("/api/chat/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getChatSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Update chat session
  app.put("/api/chat/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title } = req.body;
      
      const session = await storage.updateChatSession(id, { title });
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Delete chat session
  app.delete("/api/chat/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChatSession(id);
      res.json({ message: "Session deleted" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get chat messages for a session
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Send chat message and get AI response
  app.post("/api/chat/message", chatRateLimit, async (req, res) => {
    try {
      const { content, sessionId } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Message content is required" });
      }

      console.log(`[CONVERSATION LOG] ${new Date().toISOString()} - New conversation started`);
      console.log(`[CONVERSATION LOG] Session ID: ${sessionId || 'No Session'}`);
      console.log(`[CONVERSATION LOG] User Input: ${content}`);

      // Save user message
      const userMessage = await storage.createChatMessage({
        content,
        role: "user",
        sessionId: sessionId || null,
        sources: null
      });

      console.log(`[CONVERSATION LOG] User message saved with ID: ${userMessage.id}`);

      // Generate AI response using RAG
      // Check if this is a file upload scenario or explicitly mentions uploaded documents
      const includeUploadedDocs = content.includes('[Attached files:') || 
                                  content.includes('uploaded files') || 
                                  content.includes('analyze the uploaded') ||
                                  content.includes('assembly letter') ||
                                  content.includes('document') ||
                                  content.includes('PDF') ||
                                  content.includes('based on this');
      
      // Fetch previous messages for conversation context
      const previousMessages = sessionId
        ? (await storage.getChatMessages(sessionId)).filter(m => m.id !== userMessage.id)
        : [];

      // Resolve uploaded document content from DB
      let uploadedDocText: string | undefined;
      let uploadedDocFilename: string | undefined;
      const attachedMatch = content.match(/\[Attached files:\s*([^\]]+)\]/);
      if (attachedMatch) {
        const firstName = attachedMatch[1].split(',')[0].trim();
        if (firstName) {
          try {
            const doc = await storage.getDocumentByOriginalName(firstName);
            if (doc?.content) {
              uploadedDocText = doc.content;
              uploadedDocFilename = doc.originalName;
              console.log(`[CONVERSATION LOG] Resolved uploaded doc: ${firstName} (ID: ${doc.id})`);
            } else {
              console.warn(`[CONVERSATION LOG] Could not find uploaded doc in DB for: ${firstName}`);
            }
          } catch (err) {
            console.error(`[CONVERSATION LOG] Error resolving uploaded doc:`, err);
          }
        }
      }

      console.log(`[CONVERSATION LOG] Include uploaded docs: ${includeUploadedDocs}`);
      const ragResponse = await ragService.searchAndGenerate(content, includeUploadedDocs, previousMessages, uploadedDocText, uploadedDocFilename);

      console.log(`[CONVERSATION LOG] AI Response generated`);
      console.log(`[CONVERSATION LOG] Sources used: ${ragResponse.sources ? JSON.stringify(ragResponse.sources.map(s => s.title)) : 'None'}`);
      console.log(`[CONVERSATION LOG] AI Response: ${ragResponse.response.substring(0, 200)}...`);

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        content: ragResponse.response,
        role: "assistant",
        sessionId: sessionId || null,
        sources: ragResponse.sources
      });

      console.log(`[CONVERSATION LOG] AI message saved with ID: ${aiMessage.id}`);

      // Update session timestamp if provided
      if (sessionId) {
        await storage.updateChatSession(sessionId, { updatedAt: new Date() });
        console.log(`[CONVERSATION LOG] Session ${sessionId} timestamp updated`);
      }

      console.log(`[CONVERSATION LOG] Conversation completed successfully at ${new Date().toISOString()}`);

      res.json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      console.error(`[CONVERSATION ERROR] ${new Date().toISOString()} - Error in conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Clear chat history
  app.delete("/api/chat/messages", async (req, res) => {
    try {
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      await storage.clearChatMessages(sessionId);
      res.json({ message: sessionId ? "Session messages cleared" : "All chat history cleared" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get conversation analytics and logs
  app.get("/api/chat/analytics", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      const allMessages = await storage.getChatMessages();
      
      const analytics = {
        totalSessions: sessions.length,
        totalMessages: allMessages.length,
        userMessages: allMessages.filter(m => m.role === 'user').length,
        assistantMessages: allMessages.filter(m => m.role === 'assistant').length,
        averageMessagesPerSession: sessions.length > 0 ? (allMessages.length / sessions.length).toFixed(2) : 0,
        sessionsWithActivity: sessions.filter(s => (s.messageCount || 0) > 0).length,
        totalWordCount: allMessages.reduce((sum, m) => sum + ((m as any).wordCount || 0), 0),
        avgWordsPerMessage: allMessages.length > 0 ? 
          (allMessages.reduce((sum, m) => sum + ((m as any).wordCount || 0), 0) / allMessages.length).toFixed(2) : 0,
        recentSessions: sessions.slice(0, 10),
        recentMessages: allMessages.slice(-20)
      };
      
      console.log(`[ANALYTICS LOG] ${new Date().toISOString()} - Analytics requested. Total: ${analytics.totalSessions} sessions, ${analytics.totalMessages} messages`);
      
      res.json(analytics);
    } catch (error) {
      console.error(`[ANALYTICS ERROR] ${new Date().toISOString()} - Error fetching analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Export conversation history (for backup/analysis)
  app.get("/api/chat/export", async (req, res) => {
    try {
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const format = (req.query.format as string) || 'json';
      
      const messages = await storage.getChatMessages(sessionId);
      const sessions = sessionId ? [await storage.getChatSession(sessionId)] : await storage.getChatSessions();
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        sessionId: sessionId || 'all',
        sessions: sessions.filter(Boolean),
        messages,
        totalMessages: messages.length,
        messagesByRole: {
          user: messages.filter(m => m.role === 'user').length,
          assistant: messages.filter(m => m.role === 'assistant').length
        }
      };
      
      console.log(`[EXPORT LOG] ${new Date().toISOString()} - Conversation export requested (${format}). Session: ${sessionId || 'all'}, Messages: ${messages.length}`);
      
      if (format === 'csv') {
        // Convert to CSV format
        const csvHeader = 'ID,Session ID,Role,Content,Sources,Word Count,Created At\n';
        const csvData = messages.map(m => 
          `${m.id},"${m.sessionId || ''}","${m.role}","${m.content.replace(/"/g, '""')}","${m.sources ? JSON.stringify(m.sources).replace(/"/g, '""') : ''}",${(m as any).wordCount || 0},"${m.createdAt}"`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="chat_history_${sessionId || 'all'}_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvHeader + csvData);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="chat_history_${sessionId || 'all'}_${new Date().toISOString().split('T')[0]}.json"`);
        res.json(exportData);
      }
    } catch (error) {
      console.error(`[EXPORT ERROR] ${new Date().toISOString()} - Error exporting chat history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
