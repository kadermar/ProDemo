import { documents, chatSessions, chatMessages, productData, type Document, type ChatSession, type ChatMessage, type ProductData, type InsertDocument, type InsertChatSession, type InsertChatMessage, type InsertProductData } from "@shared/schema";

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

export const storage = new MemStorage();
