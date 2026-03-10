var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/vercel-handler.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";
import path from "path";
import fs2 from "fs";
import { nanoid } from "nanoid";
import { S3Client as S3Client2, GetObjectCommand as GetObjectCommand2 } from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrl2 } from "@aws-sdk/s3-request-presigner";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatMessages: () => chatMessages,
  chatSessions: () => chatSessions,
  documents: () => documents,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertChatSessionSchema: () => insertChatSessionSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertProductDataSchema: () => insertProductDataSchema,
  productData: () => productData
});
import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull()
});
var chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id),
  content: text("content").notNull(),
  role: text("role").notNull(),
  // 'user' or 'assistant'
  sources: jsonb("sources"),
  // Array of source references
  wordCount: integer("word_count"),
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var productData = pgTable("product_data", {
  id: serial("id").primaryKey(),
  system: text("system").notNull(),
  // 'TPO', 'EPDM', 'PVC', etc.
  manufacturer: text("manufacturer").notNull(),
  membraneType: text("membrane_type").notNull(),
  thickness: text("thickness"),
  buildingHeight: text("building_height"),
  warranty: text("warranty"),
  windSpeed: text("wind_speed"),
  location: text("location"),
  contractor: text("contractor"),
  projectName: text("project_name").notNull(),
  date: text("date"),
  specifications: jsonb("specifications").notNull(),
  sourceDocument: text("source_document")
});
var insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true
});
var insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  messageCount: true,
  createdAt: true,
  updatedAt: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  wordCount: true,
  processingTimeMs: true,
  createdAt: true
});
var insertProductDataSchema = createInsertSchema(productData).omit({
  id: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, ilike, or, sql } from "drizzle-orm";
var MemStorage = class {
  documents;
  chatSessions;
  chatMessages;
  productData;
  currentDocumentId;
  currentChatSessionId;
  currentChatMessageId;
  currentProductDataId;
  constructor() {
    this.documents = /* @__PURE__ */ new Map();
    this.chatSessions = /* @__PURE__ */ new Map();
    this.chatMessages = /* @__PURE__ */ new Map();
    this.productData = /* @__PURE__ */ new Map();
    this.currentDocumentId = 1;
    this.currentChatSessionId = 1;
    this.currentChatMessageId = 1;
    this.currentProductDataId = 1;
  }
  async createDocument(insertDocument) {
    const id = this.currentDocumentId++;
    const document = {
      ...insertDocument,
      id,
      uploadedAt: /* @__PURE__ */ new Date()
    };
    this.documents.set(id, document);
    return document;
  }
  async getDocuments() {
    return Array.from(this.documents.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }
  async getDocument(id) {
    return this.documents.get(id);
  }
  async searchDocuments(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.documents.values()).filter(
      (doc) => doc.filename.toLowerCase().includes(lowerQuery) || doc.originalName.toLowerCase().includes(lowerQuery) || doc.content.toLowerCase().includes(lowerQuery)
    );
  }
  async createChatSession(insertSession) {
    const id = this.currentChatSessionId++;
    const session = {
      ...insertSession,
      id,
      messageCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.chatSessions.set(id, session);
    return session;
  }
  async getChatSessions() {
    return Array.from(this.chatSessions.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }
  async getChatSession(id) {
    return this.chatSessions.get(id);
  }
  async updateChatSession(id, updates) {
    const session = this.chatSessions.get(id);
    if (!session) return void 0;
    const updatedSession = { ...session, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }
  async deleteChatSession(id) {
    this.chatSessions.delete(id);
    const messagesToDelete = Array.from(this.chatMessages.values()).filter((msg) => msg.sessionId === id);
    messagesToDelete.forEach((msg) => this.chatMessages.delete(msg.id));
  }
  async createChatMessage(insertMessage) {
    const id = this.currentChatMessageId++;
    const message = {
      ...insertMessage,
      id,
      sessionId: insertMessage.sessionId || null,
      sources: insertMessage.sources || null,
      wordCount: null,
      processingTimeMs: null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }
  async getChatMessages(sessionId) {
    const messages = Array.from(this.chatMessages.values());
    const filteredMessages = sessionId ? messages.filter((msg) => msg.sessionId === sessionId) : messages;
    return filteredMessages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }
  async clearChatMessages(sessionId) {
    if (sessionId) {
      const messagesToDelete = Array.from(this.chatMessages.values()).filter((msg) => msg.sessionId === sessionId);
      messagesToDelete.forEach((msg) => this.chatMessages.delete(msg.id));
    } else {
      this.chatMessages.clear();
    }
  }
  async createProductData(insertData) {
    const id = this.currentProductDataId++;
    const data = {
      ...insertData,
      id,
      thickness: insertData.thickness || null,
      buildingHeight: insertData.buildingHeight || null,
      warranty: insertData.warranty || null,
      windSpeed: insertData.windSpeed || null,
      location: insertData.location || null,
      contractor: insertData.contractor || null,
      date: insertData.date || null,
      sourceDocument: insertData.sourceDocument || null
    };
    this.productData.set(id, data);
    return data;
  }
  async getProductData() {
    return Array.from(this.productData.values());
  }
  async searchProductData(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.productData.values()).filter(
      (data) => data.system.toLowerCase().includes(lowerQuery) || data.manufacturer.toLowerCase().includes(lowerQuery) || data.membraneType.toLowerCase().includes(lowerQuery) || data.projectName.toLowerCase().includes(lowerQuery) || data.location?.toLowerCase().includes(lowerQuery) || JSON.stringify(data.specifications).toLowerCase().includes(lowerQuery)
    );
  }
  async clearAllProductData() {
    this.productData.clear();
    console.log(`[PRODUCT LOG] ${(/* @__PURE__ */ new Date()).toISOString()} - Cleared all product data from memory`);
  }
};
var storage = new MemStorage();

// server/services/vectorSearch.ts
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
async function embedQuery(query) {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query
  });
  return resp.data[0].embedding;
}
var productLibraryCache = null;
async function getProductLibrary() {
  if (productLibraryCache) return productLibraryCache;
  const result = await pool.query(`
    SELECT
      ROW_NUMBER() OVER (ORDER BY source_file) AS id,
      MIN(product_name)      AS product_name,
      MIN(manufacturer)      AS manufacturer,
      MIN(product_category)  AS product_category,
      MIN(document_type)     AS document_type,
      source_file,
      COUNT(*)               AS chunk_count
    FROM document_chunks
    WHERE source_file IS NOT NULL
    GROUP BY source_file
    ORDER BY MIN(manufacturer), MIN(product_name)
  `);
  productLibraryCache = result.rows.map((r) => ({
    id: Number(r.id),
    product_name: r.product_name ?? "",
    manufacturer: r.manufacturer ?? "",
    product_category: r.product_category ?? "",
    document_type: r.document_type ?? "",
    source_file: r.source_file,
    chunk_count: Number(r.chunk_count)
  }));
  return productLibraryCache;
}
async function searchChunks(query, topK = 8) {
  const embedding = await embedQuery(query);
  const vectorLiteral = `[${embedding.join(",")}]`;
  const result = await pool.query(
    `SELECT
       chunk_id,
       product_name,
       manufacturer,
       product_category,
       document_type,
       section_type,
       source_file,
       chunk_text,
       token_count,
       1 - (embedding <=> $1::vector) AS similarity
     FROM document_chunks
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [vectorLiteral, topK]
  );
  return result.rows;
}

// server/services/ai.ts
import OpenAI2 from "openai";
var openai2 = new OpenAI2({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});
var AIService = class {
  async generateResponse(query, context, includeUploadedDocs = false) {
    try {
      const systemPrompt = `You are a specialized Product Information Assistant for roofing systems with expertise in TPO, EPDM, and PVC membrane systems. You have access to a comprehensive database of roofing system specifications, assembly letters, and technical documentation from leading manufacturers like Carlisle and Versico.

Your role is to:
1. Provide accurate, detailed information about roofing systems (TPO, EPDM, PVC, etc.)
2. Compare different membrane types, thicknesses, and their specifications including insulation thickness options
3. Explain warranty terms, building height restrictions, and wind speed coverage
4. Analyze insulation requirements including detailed thickness options, R-values, and thermal properties
5. Cite specific sources from the provided context with document references
6. Offer recommendations based on building requirements, climate, and project needs
7. Explain technical specifications like uplift pressures, hail ratings, and deck requirements
8. Analyze uploaded documents and extract relevant information about roofing projects
9. Answer questions about uploaded documents by referencing both the document content and related product specifications
10. Extract and reference specific thickness data, thermal values, and dimensional specifications from product sheets

IMPORTANT: SOURCE PRIORITIZATION AND DETAILED SPECIFICATIONS
- PRIMARY SOURCE: Product Database with FULL PDF content analysis - ALWAYS prioritize detailed product specifications
- When answering thickness questions, search through the full PDF content and specifications data
- Extract specific numerical values from product data sheets including thickness options, R-values, and dimensions
- SECONDARY SOURCE: Assembly Letters (minimal background context only)
- UPLOADED DOCS: Only use when specifically uploaded with a query, not for general questions
- Focus answers on product specifications, features, and manufacturer data
- Reference specific product sheet PDFs when providing product information
- For insulation products, always include available thickness ranges and corresponding R-values when available
- When asked about thickness, search through the specifications object AND the source document content
- Only mention uploaded documents when they were specifically part of the user's query
- For source citations, prioritize Product Database, then Uploaded Documents, then Assembly Letters
- When answering questions about uploaded documents, provide both document analysis and relevant product recommendations

Key roofing system knowledge:
- TPO (Thermoplastic Polyolefin): Single-ply, heat-welded, energy-efficient
- EPDM (Ethylene Propylene Diene Monomer): Synthetic rubber, durable, adhered or mechanically fastened
- PVC (Polyvinyl Chloride): Chemical-resistant, heat-welded, good for restaurants/chemical exposure

Always cite your sources using the format: [Source: Product ID - Product Name] for product data or [Source: Document Name] for assembly letters. Provide specific details from the documentation including project names, locations, and exact specifications.

CRITICAL FOR THICKNESS AND SPECIFICATIONS QUERIES:
- When asked about thickness, insulation, or product specifications, examine the FULL specifications data AND source document content
- Look for detailed tables, charts, and numerical data within the product specifications
- For insulation products, provide specific thickness ranges (e.g., "Available in thicknesses from 0.5" to 4.5"")
- Include corresponding R-values and thermal properties when available
- Search through all available product data, not just the basic thickness field

CRITICAL FOR FASTENER NUMBER QUERIES (e.g., "#15 fastener", "#12 fastener"):
- You MUST examine the fullPDFContent field in specifications to find actual fastener size tables
- Look for size specifications like "15 (380)" or size ranges in the PDF content
- HP Fastener includes sizes up to 15 inches - check the PDF content for exact specifications
- InsulFast Fastener is specifically a #12 fastener according to its PDF
- Do NOT guess based on product names - use the actual PDF specifications to determine sizes

If you don't have enough information to answer a question, say so clearly and suggest what additional information would be helpful.

PRIORITY: Focus primarily on Product Database information for all roofing system questions.

PRIMARY SOURCE - Product Database (205 manufacturer product sheets):
${context.productData.slice(0, 3).map((p) => {
        let productInfo = `Product ID: ${p.id} | System: ${p.system} | Manufacturer: ${p.manufacturer}
Product: ${p.membraneType}
Project: ${p.projectName}
Source Document: ${p.sourceDocument}
Basic Thickness: ${p.thickness}
Warranty: ${p.warranty}
Basic Specs: ${JSON.stringify({
          category: p.specifications?.category,
          system: p.specifications?.system,
          applications: p.specifications?.applications?.slice(0, 2)
        }, null, 1)}`;
        if (p.specifications && p.specifications.fullPDFContent && p.specifications.fullPDFContent.length > 0) {
          productInfo += `

THICKNESS INFO:
${p.specifications.fullPDFContent}`;
        }
        return productInfo;
      }).join("\n\n---PRODUCT SEPARATOR---\n\n")}

${includeUploadedDocs ? `SECONDARY SOURCE - Uploaded Documents (ANALYZE THESE THOROUGHLY):
${JSON.stringify(context.documents.filter((doc) => !doc.filename.includes("AL_") && !doc.filename.includes("Assembly")).map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        content: doc.content,
        // Include full content for analysis
        metadata: doc.metadata
      })), null, 2)}

BACKGROUND CONTEXT - Assembly Letters (minimal reference):
${JSON.stringify(context.documents.filter((doc) => doc.filename.includes("AL_") || doc.filename.includes("Assembly")).slice(0, 1).map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        content: doc.content.substring(0, 300) + "..."
      })), null, 2)}` : "BACKGROUND CONTEXT - Assembly Letters (minimal reference only):"}

${!includeUploadedDocs ? JSON.stringify(context.documents.filter((doc) => doc.filename.includes("AL_") || doc.filename.includes("Assembly")).slice(0, 2).map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        content: doc.content.substring(0, 300) + "..."
      })), null, 2) : ""}`;
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });
      const content = response.choices[0].message.content || "";
      const sources = this.extractSources(content, context);
      return {
        content,
        sources
      };
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }
  extractSources(content, context) {
    const sources = [];
    context.productData.forEach((product) => {
      if (content.toLowerCase().includes(product.projectName.toLowerCase()) || content.toLowerCase().includes(product.manufacturer.toLowerCase()) || content.toLowerCase().includes(product.system.toLowerCase()) || content.toLowerCase().includes(product.membraneType.toLowerCase())) {
        sources.push({
          type: "product",
          id: product.id,
          title: `${product.manufacturer} ${product.system} - ${product.projectName}`,
          relevance: 0.95,
          // Higher relevance for product data
          excerpt: `${product.thickness} ${product.membraneType} system for ${product.projectName} with ${product.warranty}`
        });
      }
    });
    context.documents.filter((doc) => !doc.filename.includes("assembly")).forEach((doc) => {
      if (content.toLowerCase().includes(doc.filename.toLowerCase()) || content.toLowerCase().includes("uploaded") || content.toLowerCase().includes("document")) {
        sources.push({
          type: "document",
          id: doc.id,
          title: doc.filename,
          relevance: 0.8,
          // Medium relevance for uploaded documents
          excerpt: doc.content.substring(0, 200) + "..."
        });
      }
    });
    context.documents.filter((doc) => doc.filename.includes("assembly")).forEach((doc) => {
      if (content.toLowerCase().includes(doc.filename.toLowerCase())) {
        sources.push({
          type: "document",
          id: doc.id,
          title: doc.filename,
          relevance: 0.6,
          // Lower relevance for assembly letters
          excerpt: doc.content.substring(0, 200) + "..."
        });
      }
    });
    return sources.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }
  async generateFromChunks(query, chunks) {
    const contextBlock = chunks.map((c, i) => {
      const meta = [
        c.product_name && `Product: ${c.product_name}`,
        c.manufacturer && `Manufacturer: ${c.manufacturer}`,
        c.product_category && `Category: ${c.product_category}`,
        c.section_type && `Section: ${c.section_type}`,
        `Relevance: ${(c.similarity * 100).toFixed(1)}%`
      ].filter(Boolean).join(" | ");
      return `[${i + 1}] ${meta}
${c.chunk_text}`;
    }).join("\n\n---\n\n");
    const systemPrompt = `You are a specialized roofing product expert with access to technical data sheets from leading manufacturers (Carlisle, Versico, Owens Corning, GAF, Johns Manville, Firestone, and others).

Your role:
1. Answer questions about roofing systems (TPO, EPDM, PVC, insulation, fasteners, accessories)
2. Cite specific product specs, dimensions, R-values, wind speeds, warranty terms, installation requirements
3. Compare products across manufacturers when relevant
4. Reference the numbered context chunks below using [1], [2], etc.

CONTEXT (retrieved by semantic search, ranked by relevance):
${contextBlock}

Guidelines:
- Base answers primarily on the context above
- If context doesn't fully answer the question, say so and share what you do know
- Always cite your sources using [N] notation
- For spec comparisons, use tables when helpful
- If asked about a product not in the context, acknowledge the gap`;
    const response = await openai2.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.4,
      max_tokens: 1500
    });
    const content = response.choices[0].message.content || "";
    const sources = chunks.slice(0, 5).map((c, i) => ({
      type: "product",
      id: i + 1,
      title: [c.manufacturer, c.product_name].filter(Boolean).join(" \u2014 ") || c.source_file || "Unknown",
      relevance: c.similarity,
      excerpt: c.chunk_text.substring(0, 200) + (c.chunk_text.length > 200 ? "\u2026" : "")
    }));
    return { content, sources };
  }
  async summarizeDocument(content, filename) {
    try {
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a roofing system expert. Analyze and summarize the key information from this document, including membrane type, building specifications, warranty details, project requirements, contractor information, and any special requirements. Focus on extracting actionable roofing system information."
          },
          {
            role: "user",
            content: `Please analyze and summarize this roofing document: ${filename}

Content: ${content}`
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      });
      return response.choices[0].message.content || "";
    } catch (error) {
      throw new Error(`Document summarization error: ${error.message}`);
    }
  }
};
var aiService = new AIService();

// server/services/rag.ts
var RAGService = class {
  async searchAndGenerate(query, _includeUploadedDocs = false) {
    try {
      const chunks = await searchChunks(query, 8);
      const aiResponse = await aiService.generateFromChunks(query, chunks);
      return {
        response: aiResponse.content,
        sources: aiResponse.sources
      };
    } catch (error) {
      throw new Error(`RAG service error: ${error.message}`);
    }
  }
};
var ragService = new RAGService();

// server/services/pdf.ts
import * as fs from "fs";
import { createRequire } from "module";
var require2 = createRequire(import.meta.url);
var pdfParse = require2("pdf-parse");
var PDFProcessor = class {
  async processFile(filepath, originalName) {
    try {
      const stats = fs.statSync(filepath);
      const pdfBuffer = fs.readFileSync(filepath);
      const pdfData = await pdfParse(pdfBuffer);
      return {
        text: pdfData.text,
        metadata: {
          filename: originalName,
          size: stats.size,
          pageCount: pdfData.numpages,
          extractedAt: /* @__PURE__ */ new Date()
        }
      };
    } catch (error) {
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }
  async extractTextFromBuffer(buffer, originalName) {
    try {
      const pdfData = await pdfParse(buffer);
      return {
        text: pdfData.text,
        metadata: {
          filename: originalName,
          size: buffer.length,
          pageCount: pdfData.numpages,
          extractedAt: /* @__PURE__ */ new Date()
        }
      };
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
};
var pdfProcessor = new PDFProcessor();

// server/services/s3.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var REGION = process.env.AWS_REGION;
var BUCKET = process.env.AWS_S3_BUCKET_NAME;
var s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
async function uploadToS3(buffer, key, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  );
  return key;
}
async function getPresignedUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

// server/routes.ts
var s32 = new S3Client2({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
var BUCKET2 = process.env.AWS_S3_BUCKET_NAME;
var upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
async function registerRoutes(app2) {
  app2.get("/api/catalog", async (req, res) => {
    try {
      const products = await getProductLibrary();
      const q = req.query.q?.toLowerCase();
      const result = q ? products.filter(
        (p) => p.product_name.toLowerCase().includes(q) || p.manufacturer.toLowerCase().includes(q) || p.product_category.toLowerCase().includes(q)
      ) : products;
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/catalog/pdf", async (req, res) => {
    try {
      const key = req.query.key;
      if (!key) return res.status(400).json({ error: "key param required" });
      const command = new GetObjectCommand2({ Bucket: BUCKET2, Key: key });
      const url = await getSignedUrl2(s32, command, { expiresIn: 3600 });
      res.json({ url, expiresIn: 3600 });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/catalog/:id", async (req, res) => {
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
  app2.get("/api/documents", async (req, res) => {
    try {
      const documents2 = await storage.getDocuments();
      res.json(documents2);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const products = await storage.searchProductData(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProductData();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const products = await storage.getProductData();
      const product = products.find((p) => p.id === id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/documents/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      const meta = document.metadata;
      if (!meta?.s3Key) {
        return res.status(400).json({ error: "Document is not hosted on S3" });
      }
      const url = await getPresignedUrl(meta.s3Key, 3600);
      res.json({ url, expiresIn: 3600 });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/documents/pdf/:filename", async (req, res) => {
    try {
      const filename = decodeURIComponent(req.params.filename);
      const pdfPath = path.join(process.cwd(), "attached_assets/extracted_products", filename);
      console.log(`Attempting to serve PDF: ${pdfPath}`);
      if (!fs2.existsSync(pdfPath)) {
        console.log(`PDF file not found: ${pdfPath}`);
        return res.status(404).json({ error: `PDF file not found: ${filename}` });
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Cache-Control", "public, max-age=86400");
      const stream = fs2.createReadStream(pdfPath);
      stream.on("error", (err) => {
        console.error("Error streaming PDF:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error reading PDF file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("PDF serving error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/documents/upload", upload.array("files"), async (req, res) => {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      const uploadedDocuments = [];
      for (const file of files) {
        try {
          const pdfResult = await pdfProcessor.extractTextFromBuffer(file.buffer, file.originalname);
          const s3Key = `product-sheets/${nanoid()}-${file.originalname.replace(/\s+/g, "_")}`;
          await uploadToS3(file.buffer, s3Key, "application/pdf");
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
        }
      }
      res.json({
        message: `Successfully uploaded ${uploadedDocuments.length} documents`,
        documents: uploadedDocuments
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/documents/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const documents2 = await storage.searchDocuments(query);
      res.json(documents2);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/chat/sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/chat/sessions", async (req, res) => {
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
      console.log(`[SESSION LOG] ${(/* @__PURE__ */ new Date()).toISOString()} - New chat session created: "${title}" (ID: ${session.id})`);
      res.json(session);
    } catch (error) {
      console.error(`[SESSION ERROR] ${(/* @__PURE__ */ new Date()).toISOString()} - Error creating session: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/chat/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getChatSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/chat/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title } = req.body;
      const session = await storage.updateChatSession(id, { title });
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.delete("/api/chat/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChatSession(id);
      res.json({ message: "Session deleted" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/chat/messages", async (req, res) => {
    try {
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId) : void 0;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/chat/message", async (req, res) => {
    try {
      const { content, sessionId } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Message content is required" });
      }
      console.log(`[CONVERSATION LOG] ${(/* @__PURE__ */ new Date()).toISOString()} - New conversation started`);
      console.log(`[CONVERSATION LOG] Session ID: ${sessionId || "No Session"}`);
      console.log(`[CONVERSATION LOG] User Input: ${content}`);
      const userMessage = await storage.createChatMessage({
        content,
        role: "user",
        sessionId: sessionId || null,
        sources: null
      });
      console.log(`[CONVERSATION LOG] User message saved with ID: ${userMessage.id}`);
      const includeUploadedDocs = content.includes("[Attached files:") || content.includes("uploaded files") || content.includes("analyze the uploaded") || content.includes("assembly letter") || content.includes("document") || content.includes("PDF") || content.includes("based on this");
      console.log(`[CONVERSATION LOG] Include uploaded docs: ${includeUploadedDocs}`);
      const ragResponse = await ragService.searchAndGenerate(content, includeUploadedDocs);
      console.log(`[CONVERSATION LOG] AI Response generated`);
      console.log(`[CONVERSATION LOG] Sources used: ${ragResponse.sources ? JSON.stringify(ragResponse.sources.map((s) => s.title)) : "None"}`);
      console.log(`[CONVERSATION LOG] AI Response: ${ragResponse.response.substring(0, 200)}...`);
      const aiMessage = await storage.createChatMessage({
        content: ragResponse.response,
        role: "assistant",
        sessionId: sessionId || null,
        sources: ragResponse.sources
      });
      console.log(`[CONVERSATION LOG] AI message saved with ID: ${aiMessage.id}`);
      if (sessionId) {
        await storage.updateChatSession(sessionId, { updatedAt: /* @__PURE__ */ new Date() });
        console.log(`[CONVERSATION LOG] Session ${sessionId} timestamp updated`);
      }
      console.log(`[CONVERSATION LOG] Conversation completed successfully at ${(/* @__PURE__ */ new Date()).toISOString()}`);
      res.json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      console.error(`[CONVERSATION ERROR] ${(/* @__PURE__ */ new Date()).toISOString()} - Error in conversation: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.delete("/api/chat/messages", async (req, res) => {
    try {
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId) : void 0;
      await storage.clearChatMessages(sessionId);
      res.json({ message: sessionId ? "Session messages cleared" : "All chat history cleared" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/chat/analytics", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      const allMessages = await storage.getChatMessages();
      const analytics = {
        totalSessions: sessions.length,
        totalMessages: allMessages.length,
        userMessages: allMessages.filter((m) => m.role === "user").length,
        assistantMessages: allMessages.filter((m) => m.role === "assistant").length,
        averageMessagesPerSession: sessions.length > 0 ? (allMessages.length / sessions.length).toFixed(2) : 0,
        sessionsWithActivity: sessions.filter((s) => (s.messageCount || 0) > 0).length,
        totalWordCount: allMessages.reduce((sum, m) => sum + (m.wordCount || 0), 0),
        avgWordsPerMessage: allMessages.length > 0 ? (allMessages.reduce((sum, m) => sum + (m.wordCount || 0), 0) / allMessages.length).toFixed(2) : 0,
        recentSessions: sessions.slice(0, 10),
        recentMessages: allMessages.slice(-20)
      };
      console.log(`[ANALYTICS LOG] ${(/* @__PURE__ */ new Date()).toISOString()} - Analytics requested. Total: ${analytics.totalSessions} sessions, ${analytics.totalMessages} messages`);
      res.json(analytics);
    } catch (error) {
      console.error(`[ANALYTICS ERROR] ${(/* @__PURE__ */ new Date()).toISOString()} - Error fetching analytics: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/chat/export", async (req, res) => {
    try {
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId) : void 0;
      const format = req.query.format || "json";
      const messages = await storage.getChatMessages(sessionId);
      const sessions = sessionId ? [await storage.getChatSession(sessionId)] : await storage.getChatSessions();
      const exportData = {
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: sessionId || "all",
        sessions: sessions.filter(Boolean),
        messages,
        totalMessages: messages.length,
        messagesByRole: {
          user: messages.filter((m) => m.role === "user").length,
          assistant: messages.filter((m) => m.role === "assistant").length
        }
      };
      console.log(`[EXPORT LOG] ${(/* @__PURE__ */ new Date()).toISOString()} - Conversation export requested (${format}). Session: ${sessionId || "all"}, Messages: ${messages.length}`);
      if (format === "csv") {
        const csvHeader = "ID,Session ID,Role,Content,Sources,Word Count,Created At\n";
        const csvData = messages.map(
          (m) => `${m.id},"${m.sessionId || ""}","${m.role}","${m.content.replace(/"/g, '""')}","${m.sources ? JSON.stringify(m.sources).replace(/"/g, '""') : ""}",${m.wordCount || 0},"${m.createdAt}"`
        ).join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="chat_history_${sessionId || "all"}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`);
        res.send(csvHeader + csvData);
      } else {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="chat_history_${sessionId || "all"}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json"`);
        res.json(exportData);
      }
    } catch (error) {
      console.error(`[EXPORT ERROR] ${(/* @__PURE__ */ new Date()).toISOString()} - Error exporting chat history: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vercel-handler.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var routesReady = registerRoutes(app);
async function handler(req, res) {
  await routesReady;
  app(req, res);
}
export {
  handler as default
};
