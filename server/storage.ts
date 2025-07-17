import { documents, chatMessages, productData, type Document, type ChatMessage, type ProductData, type InsertDocument, type InsertChatMessage, type InsertProductData } from "@shared/schema";

export interface IStorage {
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  searchDocuments(query: string): Promise<Document[]>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(): Promise<ChatMessage[]>;
  clearChatMessages(): Promise<void>;
  
  // Product data operations
  createProductData(data: InsertProductData): Promise<ProductData>;
  getProductData(): Promise<ProductData[]>;
  searchProductData(query: string): Promise<ProductData[]>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, Document>;
  private chatMessages: Map<number, ChatMessage>;
  private productData: Map<number, ProductData>;
  private currentDocumentId: number;
  private currentChatMessageId: number;
  private currentProductDataId: number;

  constructor() {
    this.documents = new Map();
    this.chatMessages = new Map();
    this.productData = new Map();
    this.currentDocumentId = 1;
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

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      sources: insertMessage.sources || null,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async clearChatMessages(): Promise<void> {
    this.chatMessages.clear();
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
