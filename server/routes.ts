import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { ragService } from "./services/rag";
import { pdfProcessor } from "./services/pdf";
import { insertDocumentSchema, insertChatMessageSchema } from "@shared/schema";

const upload = multer({ 
  dest: 'uploads/',
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
  // Initialize the product database
  await ragService.initializeProductDatabase();

  // Get all documents (assembly letters)
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
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
          // Process PDF
          const pdfResult = await pdfProcessor.processFile(file.path, file.originalname);
          
          // Store document
          const documentData = {
            filename: file.filename,
            originalName: file.originalname,
            content: pdfResult.text,
            metadata: pdfResult.metadata
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

  // Get chat messages
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Send chat message and get AI response
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        content,
        role: "user",
        sources: null
      });

      // Generate AI response using RAG
      const ragResponse = await ragService.searchAndGenerate(content);

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        content: ragResponse.response,
        role: "assistant",
        sources: ragResponse.sources
      });

      res.json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Clear chat history
  app.delete("/api/chat/messages", async (req, res) => {
    try {
      await storage.clearChatMessages();
      res.json({ message: "Chat history cleared" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get product data
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProductData();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Search product data
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

  const httpServer = createServer(app);
  return httpServer;
}
