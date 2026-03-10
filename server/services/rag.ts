import { searchChunks } from './vectorSearch';
import { aiService } from './ai';

export class RAGService {
  async searchAndGenerate(
    query: string,
    _includeUploadedDocs: boolean = false
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
      const chunks = await searchChunks(query, 8);
      const aiResponse = await aiService.generateFromChunks(query, chunks);
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
