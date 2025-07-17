import { storage } from '../storage';
import { aiService, type RAGContext } from './ai';

export class RAGService {
  async searchAndGenerate(query: string): Promise<{
    response: string;
    sources: Array<{
      type: 'product' | 'document';
      id: number;
      title: string;
      relevance: number;
      excerpt: string;
    }>;
  }> {
    try {
      // Search product database
      const productData = await storage.searchProductData(query);
      
      // Search documents
      const documents = await storage.searchDocuments(query);
      
      // If no specific search results, get limited data for general queries to prevent token limit issues
      const allProductData = productData.length > 0 ? productData.slice(0, 10) : (await storage.getProductData()).slice(0, 10);
      const allDocuments = documents.length > 0 ? documents : await storage.getDocuments();
      
      // Build context for AI - PRIORITIZE PRODUCT DATA (limited to prevent token overflow)
      const context: RAGContext = {
        productData: allProductData.map(p => ({
          id: p.id,
          system: p.system,
          manufacturer: p.manufacturer,
          membraneType: p.membraneType,
          projectName: p.projectName,
          specifications: p.specifications,
          sourceDocument: p.sourceDocument || '',
          thickness: p.thickness,
          warranty: p.warranty,
          buildingHeight: p.buildingHeight,
          windSpeed: p.windSpeed,
          location: p.location,
          contractor: p.contractor,
          date: p.date
        })),
        documents: allDocuments.map(d => ({
          id: d.id,
          filename: d.filename,
          content: d.content,
          metadata: d.metadata
        }))
      };
      
      // Generate AI response
      const aiResponse = await aiService.generateResponse(query, context);
      
      return {
        response: aiResponse.content,
        sources: aiResponse.sources
      };
    } catch (error) {
      throw new Error(`RAG service error: ${error.message}`);
    }
  }

  async initializeProductDatabase(): Promise<void> {
    try {
      const { allProductSheets } = await import('../data/all-product-sheets');
      const { preloadedDocuments } = await import('../data/assembly-letters');
      
      // Check if products are already loaded
      const existingProducts = await storage.getProductData();
      if (existingProducts.length === 0) {
        // Load all product sheets from ZIP file
        for (const product of allProductSheets) {
          await storage.createProductData(product);
        }
        console.log(`Loaded ${allProductSheets.length} product sheets from ZIP file`);
      }
      
      // Check if documents are already loaded
      const existingDocuments = await storage.getDocuments();
      if (existingDocuments.length === 0) {
        // Load preloaded assembly letters (for context only)
        for (const document of preloadedDocuments) {
          await storage.createDocument(document);
        }
        console.log(`Loaded ${preloadedDocuments.length} assembly letters for context`);
      }
    } catch (error) {
      console.error('Failed to initialize product database:', error);
    }
  }
}

export const ragService = new RAGService();
