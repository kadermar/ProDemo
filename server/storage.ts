import { documents, chatSessions, chatMessages, productData, type Document, type ChatSession, type ChatMessage, type ProductData, type InsertDocument, type InsertChatSession, type InsertChatMessage, type InsertProductData } from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, and, sql } from "drizzle-orm";

export interface IStorage {
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  searchDocuments(query: string): Promise<Document[]>;
  
  // Chat session operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSessions(): Promise<ChatSession[]>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  deleteChatSession(id: number): Promise<void>;
  
  // Chat message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId?: number): Promise<ChatMessage[]>;
  clearChatMessages(sessionId?: number): Promise<void>;
  
  // Product data operations
  createProductData(data: InsertProductData): Promise<ProductData>;
  getProductData(): Promise<ProductData[]>;
  searchProductData(query: string): Promise<ProductData[]>;
  clearAllProductData?(): Promise<void>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, Document>;
  private chatSessions: Map<number, ChatSession>;
  private chatMessages: Map<number, ChatMessage>;
  private productData: Map<number, ProductData>;
  private currentDocumentId: number;
  private currentChatSessionId: number;
  private currentChatMessageId: number;
  private currentProductDataId: number;

  constructor() {
    this.documents = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.productData = new Map();
    this.currentDocumentId = 1;
    this.currentChatSessionId = 1;
    this.currentChatMessageId = 1;
    this.currentProductDataId = 1;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = {
      ...insertDocument,
      id,
      uploadedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort((a, b) => 
      b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.documents.values()).filter(doc =>
      doc.filename.toLowerCase().includes(lowerQuery) ||
      doc.originalName.toLowerCase().includes(lowerQuery) ||
      doc.content.toLowerCase().includes(lowerQuery)
    );
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentChatSessionId++;
    const session: ChatSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates, updatedAt: new Date() };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteChatSession(id: number): Promise<void> {
    this.chatSessions.delete(id);
    // Also delete all messages in this session
    const messagesToDelete = Array.from(this.chatMessages.values()).filter(msg => msg.sessionId === id);
    messagesToDelete.forEach(msg => this.chatMessages.delete(msg.id));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      sessionId: insertMessage.sessionId || null,
      sources: insertMessage.sources || null,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(sessionId?: number): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values());
    const filteredMessages = sessionId 
      ? messages.filter(msg => msg.sessionId === sessionId)
      : messages;
    return filteredMessages.sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async clearChatMessages(sessionId?: number): Promise<void> {
    if (sessionId) {
      const messagesToDelete = Array.from(this.chatMessages.values()).filter(msg => msg.sessionId === sessionId);
      messagesToDelete.forEach(msg => this.chatMessages.delete(msg.id));
    } else {
      this.chatMessages.clear();
    }
  }

  async createProductData(insertData: InsertProductData): Promise<ProductData> {
    const id = this.currentProductDataId++;
    const data: ProductData = {
      ...insertData,
      id,
      thickness: insertData.thickness || null,
      buildingHeight: insertData.buildingHeight || null,
      warranty: insertData.warranty || null,
      windSpeed: insertData.windSpeed || null,
      location: insertData.location || null,
      contractor: insertData.contractor || null,
      date: insertData.date || null,
      sourceDocument: insertData.sourceDocument || null,
    };
    this.productData.set(id, data);
    return data;
  }

  async getProductData(): Promise<ProductData[]> {
    return Array.from(this.productData.values());
  }

  async searchProductData(query: string): Promise<ProductData[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.productData.values()).filter(data =>
      data.system.toLowerCase().includes(lowerQuery) ||
      data.manufacturer.toLowerCase().includes(lowerQuery) ||
      data.membraneType.toLowerCase().includes(lowerQuery) ||
      data.projectName.toLowerCase().includes(lowerQuery) ||
      data.location?.toLowerCase().includes(lowerQuery) ||
      JSON.stringify(data.specifications).toLowerCase().includes(lowerQuery)
    );
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getDocuments(): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .orderBy(desc(documents.uploadedAt));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document || undefined;
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const searchPattern = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(documents)
      .where(
        or(
          ilike(documents.filename, searchPattern),
          ilike(documents.originalName, searchPattern),
          ilike(documents.content, searchPattern)
        )
      )
      .orderBy(desc(documents.uploadedAt));
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values({
        title: insertSession.title
      })
      .returning();
    return session;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .orderBy(desc(chatSessions.updatedAt));
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const [session] = await db
      .update(chatSessions)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(chatSessions.id, id))
      .returning();
    return session || undefined;
  }

  async deleteChatSession(id: number): Promise<void> {
    // First delete all messages in this session
    await db
      .delete(chatMessages)
      .where(eq(chatMessages.sessionId, id));
    
    // Then delete the session
    await db
      .delete(chatSessions)
      .where(eq(chatSessions.id, id));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const wordCount = insertMessage.content.split(/\s+/).length;
    
    const [message] = await db
      .insert(chatMessages)
      .values({
        content: insertMessage.content,
        role: insertMessage.role,
        sessionId: insertMessage.sessionId,
        sources: insertMessage.sources,
        wordCount,
        processingTimeMs: null
      })
      .returning();
    
    // Update session message count if session exists
    if (insertMessage.sessionId) {
      const messageCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, insertMessage.sessionId));
        
      await db
        .update(chatSessions)
        .set({ messageCount: messageCount[0]?.count || 0 })
        .where(eq(chatSessions.id, insertMessage.sessionId));
    }
    
    // Log every conversation message for comprehensive tracking
    console.log(`[CHAT LOG] ${new Date().toISOString()} - Session: ${insertMessage.sessionId || 'No Session'} - Role: ${insertMessage.role} - Words: ${wordCount} - Content: ${insertMessage.content.substring(0, 100)}...`);
    
    return message;
  }

  async getChatMessages(sessionId?: number): Promise<ChatMessage[]> {
    const query = db
      .select()
      .from(chatMessages);
    
    if (sessionId) {
      return await query
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(chatMessages.createdAt);
    } else {
      return await query
        .orderBy(chatMessages.createdAt);
    }
  }

  async clearChatMessages(sessionId?: number): Promise<void> {
    if (sessionId) {
      await db
        .delete(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId));
      console.log(`[CHAT LOG] ${new Date().toISOString()} - Cleared messages for session: ${sessionId}`);
    } else {
      await db.delete(chatMessages);
      console.log(`[CHAT LOG] ${new Date().toISOString()} - Cleared all chat messages`);
    }
  }

  async createProductData(insertData: InsertProductData): Promise<ProductData> {
    const [data] = await db
      .insert(productData)
      .values(insertData)
      .returning();
    return data;
  }

  async getProductData(): Promise<ProductData[]> {
    return await db
      .select()
      .from(productData);
  }

  async searchProductData(query: string): Promise<ProductData[]> {
    const searchPattern = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(productData)
      .where(
        or(
          ilike(productData.system, searchPattern),
          ilike(productData.manufacturer, searchPattern),
          ilike(productData.membraneType, searchPattern),
          ilike(productData.projectName, searchPattern),
          ilike(productData.location, searchPattern)
        )
      );
  }

  async clearAllProductData(): Promise<void> {
    await db.delete(productData);
    console.log(`[PRODUCT LOG] ${new Date().toISOString()} - Cleared all product data`);
  }
}

export const storage = new DatabaseStorage();
