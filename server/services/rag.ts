import { searchChunks } from './vectorSearch';
import { aiService } from './ai';

export class RAGService {
  async searchAndGenerate(
    query: string,
    includeUploadedDocs: boolean = false,
    conversationHistory: Array<{ role: string; content: string }> = [],
    uploadedDocText?: string,
    uploadedDocFilename?: string
  ): Promise<{
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
      // Assembly letter analysis path: uploaded doc content is available
      if (includeUploadedDocs && uploadedDocText && uploadedDocFilename) {
        const productChunks = await searchChunks(query, 10);
        const aiResponse = await aiService.analyzeAssemblyLetter(
          uploadedDocText,
          uploadedDocFilename,
          productChunks,
          conversationHistory
        );
        return {
          response: aiResponse.content,
          sources: aiResponse.sources,
        };
      }

      // Default RAG path
      const chunks = await searchChunks(query, 8);
      const aiResponse = await aiService.generateFromChunks(query, chunks, conversationHistory);
      return {
        response: aiResponse.content,
        sources: aiResponse.sources,
      };
    } catch (error: any) {
      throw new Error(`RAG service error: ${error.message}`);
    }
  }
}

export const ragService = new RAGService();
