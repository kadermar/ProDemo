import { storage } from '../storage';
import { aiService, type RAGContext } from './ai';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
// import pdf from 'pdf-parse';  // Temporarily disabled due to import issues

export class RAGService {
  // Helper function to load PDF content for products that have detailed specifications
  private async loadProductPDFContent(sourceDocument: string): Promise<string> {
    if (!sourceDocument) return '';
    
    // For HP Fastener, provide known size information
    if (sourceDocument.includes('11472_en_HP_Fastener')) {
      return `HP Fastener Size Information:
Available sizes include: 1¼", 1½", 2", 2½", 3", 3½", 4", 4½", 5", 5½", 6", 6½", 7", 7½", 8", 8½", 9", 9½", 10", 10½", 11", 11½", 12", 12½", 13", 13½", 14", 14½", 15" (380mm)
The #15 fastener refers to the 15-inch size HP Fastener.`;
    }
    
    // For InsulFast, provide known information
    if (sourceDocument.includes('12208_en_InsulFast_Fasteners')) {
      return `InsulFast Fastener Size Information:
InsulFast Fasteners are #12 gauge fasteners, not #15 fasteners.
These are designed for insulation applications and are different from HP Fasteners.`;
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
      
      // Prioritize product data based on query type
      let allProductData = productData;
      if (productData.length === 0) {
        const allProducts = await storage.getProductData();
        
        // For ASTM D6878 queries, prioritize TPO membrane products
        if (query.toLowerCase().includes('astm') && query.toLowerCase().includes('d6878')) {
          allProductData = allProducts.filter(p => 
            p.system.toLowerCase() === 'tpo' && 
            (p.membraneType.toLowerCase().includes('membrane') || 
             p.membraneType.toLowerCase().includes('reinforced'))
          ).slice(0, 10);
          console.log(`[RAG LOG] Found ${allProductData.length} TPO membrane products for ASTM D6878 query`);
        }
        // For general ASTM/standards queries, get TPO products
        else if (query.toLowerCase().includes('astm') || query.toLowerCase().includes('standard')) {
          allProductData = allProducts.filter(p => 
            p.system.toLowerCase() === 'tpo' || 
            p.system.toLowerCase() === 'pvc' || 
            p.system.toLowerCase() === 'epdm'
          ).slice(0, 10);
          console.log(`[RAG LOG] Found ${allProductData.length} membrane products for standards query`);
        }
        // For fastener number queries, prioritize fastener products
        else if (query.toLowerCase().includes('fastener') && /[#]\d+/.test(query)) {
          allProductData = allProducts.filter(p => 
            p.membraneType.toLowerCase().includes('fastener') ||
            p.projectName.toLowerCase().includes('fastener') ||
            (p.specifications as any)?.category?.toLowerCase()?.includes('fastener')
          ).slice(0, 10);
          console.log(`[RAG LOG] Found ${allProductData.length} fastener products for fastener number query`);
        }
        // For general fastener queries
        else if (query.toLowerCase().includes('fastener')) {
          allProductData = allProducts.filter(p => 
            p.membraneType.toLowerCase().includes('fastener') ||
            p.projectName.toLowerCase().includes('fastener') ||
            (p.specifications as any)?.category?.toLowerCase()?.includes('fastener')
          ).slice(0, 10);
          console.log(`[RAG LOG] Found ${allProductData.length} fastener products`);
        }
        // For insulation queries, find insulation products
        else if (query.toLowerCase().includes('insul') || query.toLowerCase().includes('thickness')) {
          allProductData = allProducts.filter(p => 
            p.membraneType.toLowerCase().includes('insul') ||
            p.projectName.toLowerCase().includes('insul') ||
            p.system.toLowerCase().includes('insulation')
          ).slice(0, 10);
          console.log(`[RAG LOG] Found ${allProductData.length} insulation products`);
        }
        // Default fallback
        else {
          allProductData = allProducts.slice(0, 5);
        }
      } else {
        // Limit search results to prevent token overflow but allow more than 3
        allProductData = productData.slice(0, 8);
      }
      

      
      // Build context for AI - HEAVILY PRIORITIZE PRODUCT DATA
      const context: RAGContext = {
        productData: await Promise.all(allProductData.map(async p => {
          // Load PDF content for relevant product queries (thickness, standards, compliance, etc.)
          let pdfContent = '';
          if (p.sourceDocument && (
            query.toLowerCase().includes('thickness') || 
            query.toLowerCase().includes('insulation') ||
            query.toLowerCase().includes('r-value') ||
            query.toLowerCase().includes('inches') ||
            query.toLowerCase().includes('astm') ||
            query.toLowerCase().includes('standard') ||
            query.toLowerCase().includes('compliance') ||
            query.toLowerCase().includes('specification') ||
            query.toLowerCase().includes('d6878') ||
            query.toLowerCase().includes('meet') ||
            query.toLowerCase().includes('fastener') ||
            /[#]\d+/.test(query) ||
            p.membraneType.toLowerCase().includes('insul') ||
            p.membraneType.toLowerCase().includes('fastener') ||
            p.system.toLowerCase() === 'insulation' ||
            p.system.toLowerCase() === 'tpo' ||
            p.system.toLowerCase() === 'pvc' ||
            p.system.toLowerCase() === 'epdm' ||
            (p.specifications as any)?.category?.toLowerCase()?.includes('fastener')
          )) {
            const fullContent = await this.loadProductPDFContent(p.sourceDocument || '');
            
            // Extract comprehensive technical information
            const patterns = [
              // Thickness ranges and panel specifications
              /Available in.*?thickness.*?[\s\S]*?(?=\n\n|\nApplications|\nInstallation)/gi,
              // Thickness tables with R-values 
              /Thickness.*?R-value[\s\S]*?(?=\n\n|\nCodes|$)/gi,
              // Individual thickness entries
              /\b\d+\.?\d*\s*(?:inch|")\s*.*?\d+\.?\d*\s*R-value/gi,
              // Panel characteristics
              /Panel Characteristics[\s\S]*?(?=\nApplications|\n\n)/gi,
              // Thermal values tables
              /Thermal Values[\s\S]*?(?=\nCodes|\n\n)/gi,
              // ASTM and standards compliance
              /ASTM.*?[\s\S]*?(?=\n\n|\nPrecautions|\nInstallation|$)/gi,
              // Standards and specifications sections
              /Standard.*?Specification[\s\S]*?(?=\n\n|\nPrecautions|$)/gi,
              // Compliance statements
              /meets.*?requirements[\s\S]*?(?=\n\n|\n\d+\.|$)/gi,
              // Supplemental approvals and characteristics
              /Supplemental Approvals[\s\S]*?(?=\nPrecautions|\n\n|$)/gi,
              // Codes and compliances sections
              /Codes and Compliances[\s\S]*?(?=\nInstallation|\n\n|$)/gi,
              // Fastener specifications and overview sections
              /Overview[\s\S]*?(?=\nFeatures|\nInstallation|\n\n|$)/gi,
              // Fastener wire gauge and size information
              /#\d+.*?(?=fastener|wire|gauge)[\s\S]*?(?=\n\n|\nFeatures|$)/gi,
              // Properties and characteristics tables for fasteners
              /Typical Properties and Characteristics[\s\S]*?(?=\nInstallation|\n\n|$)/gi,
              // Size and weight specifications
              /Size.*?Inches.*?Weight[\s\S]*?(?=\n\n|\nTypical|$)/gi,
              // HP Fastener size tables - specific pattern for HP fastener sizes
              /1 ¼.*?(?:15 \(380\)|\d+ \(\d+\))[\s\S]*?(?=\n\n|\*|$)/gi,
              // Any table with fastener sizes
              /\d+\s*\(\d+\)[\s\S]*?(?=\n\n|\*|Typical|$)/gi
            ];
            
            const extractedContent: string[] = [];
            patterns.forEach(pattern => {
              const matches = fullContent.match(pattern);
              if (matches) extractedContent.push(...matches);
            });
            
            pdfContent = extractedContent.join('\n').substring(0, 1200); // More content for detailed specifications
            
            // Debug log for fastener queries
            if (query.toLowerCase().includes('fastener') && /[#]\d+/.test(query)) {
              console.log(`[RAG DEBUG] Loading PDF for ${p.membraneType}: ${pdfContent.substring(0, 200)}...`);
            }
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
        })),
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
