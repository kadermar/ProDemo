import { storage } from '../storage';
import { aiService, type RAGContext } from './ai';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export class RAGService {
  // Helper function to load PDF content for products that have detailed specifications
  private loadProductPDFContent(sourceDocument: string): string {
    if (!sourceDocument) return '';
    
    try {
      const pdfPath = join(process.cwd(), 'attached_assets', 'extracted_products', sourceDocument);
      if (existsSync(pdfPath)) {
        return readFileSync(pdfPath, 'utf-8');
      }
    } catch (error: any) {
      console.log(`Could not load PDF content for ${sourceDocument}:`, error.message);
    }
    return '';
  }
  async searchAndGenerate(query: string, includeUploadedDocs: boolean = false): Promise<{
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
      // Search product database (primary source - always prioritized)
      const productData = await storage.searchProductData(query);
      
      // Only search uploaded documents if explicitly requested
      let uploadedDocuments: any[] = [];
      if (includeUploadedDocs) {
        // Get all documents (not just search results) to include recently uploaded ones
        const allDocs = await storage.getDocuments();
        uploadedDocuments = allDocs.filter(doc => 
          !doc.filename.includes('AL_') && 
          !doc.filename.includes('Assembly') &&
          !doc.filename.includes('Montgomery') &&
          !doc.filename.includes('Dexter') &&
          !doc.filename.includes('Miller')
        );
        
        // If we have a specific search query, still do the search for relevant content
        if (query && query.trim()) {
          const searchResults = await storage.searchDocuments(query);
          // Combine search results with all uploaded documents, prioritizing search results
          uploadedDocuments = [...searchResults, ...uploadedDocuments.filter(doc => 
            !searchResults.some(sr => sr.id === doc.id)
          )];
        }
        
        console.log(`[RAG LOG] Found ${uploadedDocuments.length} uploaded documents to include`);
      }
      
      // Get assembly letters for minimal background context only
      const allDocuments = await storage.getDocuments();
      const assemblyLetters = allDocuments
        .filter(doc => 
          doc.filename.includes('AL_') || 
          doc.filename.includes('Assembly') ||
          doc.filename.includes('Montgomery') ||
          doc.filename.includes('Dexter') ||
          doc.filename.includes('Miller')
        )
        .slice(0, 2); // Limit to 2 assembly letters for context
      
      // Prioritize product data - limit to prevent token overflow
      const allProductData = productData.length > 0 ? productData.slice(0, 8) : (await storage.getProductData()).slice(0, 8);
      
      // Build context for AI - HEAVILY PRIORITIZE PRODUCT DATA
      const context: RAGContext = {
        productData: allProductData.map(p => {
          // Load full PDF content for products that might have detailed specifications
          let pdfContent = '';
          if (p.sourceDocument && (
            query.toLowerCase().includes('thickness') || 
            query.toLowerCase().includes('insulation') ||
            query.toLowerCase().includes('specification') ||
            query.toLowerCase().includes('dimension') ||
            query.toLowerCase().includes('r-value') ||
            p.membraneType.toLowerCase().includes('insul') ||
            p.system === 'Other' // Many insulation products are categorized as 'Other'
          )) {
            pdfContent = this.loadProductPDFContent(p.sourceDocument || '');
          }
          
          return {
            id: p.id,
            system: p.system,
            manufacturer: p.manufacturer,
            membraneType: p.membraneType,
            projectName: p.projectName,
            specifications: {
              ...(p.specifications || {}),
              fullPDFContent: pdfContent // Include full PDF content for detailed analysis
            },
            sourceDocument: p.sourceDocument || '',
            thickness: p.thickness || undefined,
            warranty: p.warranty || undefined,
            buildingHeight: p.buildingHeight || undefined,
            windSpeed: p.windSpeed || undefined,
            location: p.location || undefined,
            contractor: p.contractor || undefined,
            date: p.date || undefined
          };
        }),
        // Include uploaded docs only when specifically requested
        documents: includeUploadedDocs ? 
          [...uploadedDocuments.slice(0, 5), ...assemblyLetters.slice(0, 1)].map(d => ({
            id: d.id,
            filename: d.filename,
            content: d.content, // Include full content for proper analysis
            metadata: d.metadata
          })) :
          // Just assembly letters for minimal context
          assemblyLetters.map(d => ({
            id: d.id,
            filename: d.filename,
            content: d.content.substring(0, 500), // Limit content to keep focus on products
            metadata: d.metadata
          }))
      };
      
      // Generate AI response with instructions to prioritize product data
      const aiResponse = await aiService.generateResponse(query, context, includeUploadedDocs);
      
      return {
        response: aiResponse.content,
        sources: aiResponse.sources
      };
    } catch (error: any) {
      throw new Error(`RAG service error: ${error.message}`);
    }
  }

  async initializeProductDatabase(): Promise<void> {
    try {
      const { allProductSheets } = await import('../data/all-product-sheets');
      const { preloadedDocuments } = await import('../data/assembly-letters');
      
      // Always ensure we have exactly 205 products (clean reload if needed)
      const existingProducts = await storage.getProductData();
      if (existingProducts.length !== 205) {
        // Clear existing and reload clean data
        if (existingProducts.length > 0) {
          console.log(`Clearing ${existingProducts.length} existing products to prevent duplicates`);
          await storage.clearAllProductData();
        }
        
        console.log(`Loading ${allProductSheets.length} product sheets from ZIP file`);
        let loadedCount = 0;
        for (const product of allProductSheets) {
          try {
            await storage.createProductData(product);
            loadedCount++;
          } catch (error) {
            console.error(`Failed to load product ${product.projectName}:`, error);
          }
        }
        console.log(`Successfully loaded ${loadedCount} out of ${allProductSheets.length} product sheets`);
      } else {
        console.log(`Product database contains correct number of products: ${existingProducts.length}`);
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
