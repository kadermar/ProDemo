import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface AIResponse {
  content: string;
  sources: Array<{
    type: 'product' | 'document';
    id: number;
    title: string;
    relevance: number;
    excerpt: string;
  }>;
}

export interface RAGContext {
  productData: Array<{
    id: number;
    system: string;
    manufacturer: string;
    membraneType: string;
    projectName: string;
    specifications: any;
    sourceDocument: string;
    thickness?: string;
    warranty?: string;
    buildingHeight?: string;
    windSpeed?: string;
    location?: string;
    contractor?: string;
    date?: string;
  }>;
  documents: Array<{
    id: number;
    filename: string;
    content: string;
    metadata: any;
  }>;
}

export class AIService {
  async generateResponse(query: string, context: RAGContext): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a specialized Product Information Assistant for roofing systems with expertise in TPO, EPDM, and PVC membrane systems. You have access to a comprehensive database of roofing system specifications, assembly letters, and technical documentation from leading manufacturers like Carlisle and Versico.

Your role is to:
1. Provide accurate, detailed information about roofing systems (TPO, EPDM, PVC, etc.)
2. Compare different membrane types, thicknesses, and their specifications
3. Explain warranty terms, building height restrictions, and wind speed coverage
4. Analyze insulation requirements and installation methods
5. Cite specific sources from the provided context with document references
6. Offer recommendations based on building requirements, climate, and project needs
7. Explain technical specifications like uplift pressures, hail ratings, and deck requirements
8. Analyze uploaded documents and extract relevant information about roofing projects
9. Answer questions about uploaded documents by referencing both the document content and related product specifications

IMPORTANT: DOCUMENT ANALYSIS AND SOURCE PRIORITIZATION
- Primary source: Product Database (contains structured product specifications from zip files)
- Secondary source: Uploaded Documents (user-provided PDFs with project-specific information)
- Tertiary source: Assembly Letters (provides additional context and project examples)
- When analyzing uploaded documents, extract key information like project details, specifications, requirements
- Cross-reference uploaded document content with relevant product database entries
- For source citations, prioritize Product Database, then Uploaded Documents, then Assembly Letters
- When answering questions about uploaded documents, provide both document analysis and relevant product recommendations

Key roofing system knowledge:
- TPO (Thermoplastic Polyolefin): Single-ply, heat-welded, energy-efficient
- EPDM (Ethylene Propylene Diene Monomer): Synthetic rubber, durable, adhered or mechanically fastened
- PVC (Polyvinyl Chloride): Chemical-resistant, heat-welded, good for restaurants/chemical exposure

Always cite your sources using the format: [Source: Product ID - Product Name] for product data or [Source: Document Name] for assembly letters. Provide specific details from the documentation including project names, locations, and exact specifications. If you don't have enough information to answer a question, say so clearly and suggest what additional information would be helpful.

Context Information:
Product Database: ${JSON.stringify(context.productData.slice(0, 5).map(p => ({
  id: p.id,
  system: p.system,
  manufacturer: p.manufacturer,
  membraneType: p.membraneType,
  projectName: p.projectName,
  thickness: p.thickness,
  warranty: p.warranty,
  sourceDocument: p.sourceDocument
})), null, 2)}
Uploaded Documents: ${JSON.stringify(context.documents.filter(doc => !doc.filename.includes('assembly')).map(doc => ({
  id: doc.id,
  filename: doc.filename,
  content: doc.content.substring(0, 800) + "...",
  metadata: doc.metadata
})), null, 2)}

Assembly Letters (Context): ${JSON.stringify(context.documents.filter(doc => doc.filename.includes('assembly')).map(doc => ({
  id: doc.id,
  filename: doc.filename,
  content: doc.content.substring(0, 400) + "..."
})), null, 2)}`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content || "";
      
      // Extract potential sources from the response
      const sources = this.extractSources(content, context);

      return {
        content,
        sources
      };
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  private extractSources(content: string, context: RAGContext): Array<{
    type: 'product' | 'document';
    id: number;
    title: string;
    relevance: number;
    excerpt: string;
  }> {
    const sources: Array<{
      type: 'product' | 'document';
      id: number;
      title: string;
      relevance: number;
      excerpt: string;
    }> = [];

    // PRIORITIZE PRODUCT DATA - Higher relevance scores
    context.productData.forEach(product => {
      if (content.toLowerCase().includes(product.projectName.toLowerCase()) ||
          content.toLowerCase().includes(product.manufacturer.toLowerCase()) ||
          content.toLowerCase().includes(product.system.toLowerCase()) ||
          content.toLowerCase().includes(product.membraneType.toLowerCase())) {
        sources.push({
          type: 'product',
          id: product.id,
          title: `${product.manufacturer} ${product.system} - ${product.projectName}`,
          relevance: 0.95, // Higher relevance for product data
          excerpt: `${product.thickness} ${product.membraneType} system for ${product.projectName} with ${product.warranty}`
        });
      }
    });

    // Secondary: Uploaded documents (medium relevance)
    context.documents.filter(doc => !doc.filename.includes('assembly')).forEach(doc => {
      if (content.toLowerCase().includes(doc.filename.toLowerCase()) ||
          content.toLowerCase().includes('uploaded') ||
          content.toLowerCase().includes('document')) {
        sources.push({
          type: 'document',
          id: doc.id,
          title: doc.filename,
          relevance: 0.8, // Medium relevance for uploaded documents
          excerpt: doc.content.substring(0, 200) + "..."
        });
      }
    });

    // Tertiary: Assembly letters (lower relevance)
    context.documents.filter(doc => doc.filename.includes('assembly')).forEach(doc => {
      if (content.toLowerCase().includes(doc.filename.toLowerCase())) {
        sources.push({
          type: 'document',
          id: doc.id,
          title: doc.filename,
          relevance: 0.6, // Lower relevance for assembly letters
          excerpt: doc.content.substring(0, 200) + "..."
        });
      }
    });

    // Sort by relevance (product data first) and return top 5
    return sources.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  async summarizeDocument(content: string, filename: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a roofing system expert. Analyze and summarize the key information from this document, including membrane type, building specifications, warranty details, project requirements, contractor information, and any special requirements. Focus on extracting actionable roofing system information."
          },
          {
            role: "user",
            content: `Please analyze and summarize this roofing document: ${filename}\n\nContent: ${content}`
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      throw new Error(`Document summarization error: ${error.message}`);
    }
  }
}

export const aiService = new AIService();
