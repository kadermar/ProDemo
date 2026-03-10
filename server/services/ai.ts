import OpenAI from "openai";
import type { VectorChunk } from './vectorSearch';

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
  async generateResponse(query: string, context: RAGContext, includeUploadedDocs: boolean = false): Promise<AIResponse> {
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
${context.productData.slice(0, 3).map(p => {
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

  // Include minimal PDF content for thickness analysis
  if (p.specifications && p.specifications.fullPDFContent && p.specifications.fullPDFContent.length > 0) {
    productInfo += `\n\nTHICKNESS INFO:\n${p.specifications.fullPDFContent}`;
  }
  
  return productInfo;
}).join('\n\n---PRODUCT SEPARATOR---\n\n')}

${includeUploadedDocs ? 
`SECONDARY SOURCE - Uploaded Documents (ANALYZE THESE THOROUGHLY):
${JSON.stringify(context.documents.filter(doc => !doc.filename.includes('AL_') && !doc.filename.includes('Assembly')).map(doc => ({
  id: doc.id,
  filename: doc.filename,
  content: doc.content, // Include full content for analysis
  metadata: doc.metadata
})), null, 2)}

BACKGROUND CONTEXT - Assembly Letters (minimal reference):
${JSON.stringify(context.documents.filter(doc => doc.filename.includes('AL_') || doc.filename.includes('Assembly')).slice(0, 1).map(doc => ({
  id: doc.id,
  filename: doc.filename,
  content: doc.content.substring(0, 300) + "..."
})), null, 2)}` : 
'BACKGROUND CONTEXT - Assembly Letters (minimal reference only):'}

${!includeUploadedDocs ? 
JSON.stringify(context.documents.filter(doc => doc.filename.includes('AL_') || doc.filename.includes('Assembly')).slice(0, 2).map(doc => ({
  id: doc.id,
  filename: doc.filename,
  content: doc.content.substring(0, 300) + "..."
})), null, 2) : ''}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
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
    } catch (error: any) {
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

  async generateFromChunks(
    query: string,
    chunks: VectorChunk[]
  ): Promise<AIResponse> {
    const contextBlock = chunks
      .map((c, i) => {
        const meta = [
          c.product_name && `Product: ${c.product_name}`,
          c.manufacturer && `Manufacturer: ${c.manufacturer}`,
          c.product_category && `Category: ${c.product_category}`,
          c.section_type && `Section: ${c.section_type}`,
          `Relevance: ${(c.similarity * 100).toFixed(1)}%`,
        ]
          .filter(Boolean)
          .join(' | ');
        return `[${i + 1}] ${meta}\n${c.chunk_text}`;
      })
      .join('\n\n---\n\n');

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content || "";

    // Build sources from the chunks that were actually retrieved
    const sources = chunks.slice(0, 5).map((c, i) => ({
      type: 'product' as const,
      id: i + 1,
      title: [c.manufacturer, c.product_name].filter(Boolean).join(' — ') || c.source_file || 'Unknown',
      relevance: c.similarity,
      excerpt: c.chunk_text.substring(0, 200) + (c.chunk_text.length > 200 ? '…' : ''),
    }));

    return { content, sources };
  }

  async summarizeDocument(content: string, filename: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
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
    } catch (error: any) {
      throw new Error(`Document summarization error: ${error.message}`);
    }
  }
}

export const aiService = new AIService();
