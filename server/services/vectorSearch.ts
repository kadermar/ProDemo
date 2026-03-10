import { pool } from '../db';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export interface VectorChunk {
  chunk_id: string;
  product_name: string | null;
  manufacturer: string | null;
  product_category: string | null;
  document_type: string | null;
  section_type: string | null;
  source_file: string | null;
  chunk_text: string;
  token_count: number | null;
  similarity: number;
}

export async function embedQuery(query: string): Promise<number[]> {
  const resp = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  return resp.data[0].embedding;
}

export interface ProductSheet {
  id: number;
  product_name: string;
  manufacturer: string;
  product_category: string;
  document_type: string;
  source_file: string;
  chunk_count: number;
}

let productLibraryCache: ProductSheet[] | null = null;
// Invalidate cache every hour so name/type fixes are picked up
setInterval(() => { productLibraryCache = null; }, 60 * 60 * 1000);

// Strip "Material Name:" prefix from SDS product names
function stripMaterialNamePrefix(name: string): string {
  return name.replace(/^material\s+name\s*:\s*/i, '').trim();
}

// Detect spaced-out OCR text like "T E C H N I C A L  D A T A  B U L L E T I N"
function isSpacedOutJunk(name: string): boolean {
  const collapsed = name.replace(/\s+/g, '').toLowerCase();
  return (
    collapsed.includes('technicaldatabulletin') ||
    collapsed.includes('safetydatasheet') ||
    collapsed.includes('productdatasheet') ||
    name.length > 4 && /^([a-z]\s){4,}/i.test(name)
  );
}

// Extract a readable name from the source filename
function nameFromFilename(sourceFile: string): string {
  const base = sourceFile.split('/').pop() ?? sourceFile;
  // Remove extension
  let name = base.replace(/\.pdf$/i, '');
  // Remove leading numeric ID like "10001_en_" or "600491 " or "600491_"
  name = name.replace(/^\d+[\s_]+(?:en[\s_]+)?/i, '');
  // Remove trailing doc-type suffixes
  name = name.replace(/[\s_]+(Product[\s_]+Data[\s_]+Sheet|PDS|PDSTDB|Safety[\s_]+Data[\s_]+Sheet|SDS|TDB|Technical[\s_]+Data[\s_]+Bulletin)[\s\w\-]*$/i, '');
  // Replace underscores/hyphens with spaces and trim
  return name.replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanProductName(rawName: string, sourceFile: string): string {
  let name = stripMaterialNamePrefix(rawName);
  if (!name || isSpacedOutJunk(name)) {
    name = nameFromFilename(sourceFile);
  }
  return name || rawName;
}

export async function getProductLibrary(): Promise<ProductSheet[]> {
  if (productLibraryCache) return productLibraryCache;

  const result = await pool.query(`
    SELECT
      ROW_NUMBER() OVER (ORDER BY source_file) AS id,
      MIN(product_name) AS product_name,
      MIN(manufacturer) AS manufacturer,
      MIN(product_category) AS product_category,
      CASE
        WHEN MIN(document_type) ILIKE '%safety%'
          OR bool_or(chunk_text ILIKE '%safety data sheet%')
        THEN 'safety data sheet'
        ELSE MIN(document_type)
      END AS document_type,
      source_file,
      COUNT(*) AS chunk_count
    FROM document_chunks
    WHERE source_file IS NOT NULL
    GROUP BY source_file
    ORDER BY MIN(manufacturer), MIN(product_name)
  `);

  productLibraryCache = result.rows.map((r: any) => ({
    id: Number(r.id),
    product_name: cleanProductName(r.product_name ?? '', r.source_file ?? ''),
    manufacturer: r.manufacturer ?? '',
    product_category: r.product_category ?? '',
    document_type: r.document_type ?? '',
    source_file: r.source_file,
    chunk_count: Number(r.chunk_count),
  }));

  return productLibraryCache!;
}

export function invalidateProductLibraryCache() {
  productLibraryCache = null;
}

export async function searchChunks(query: string, topK = 8): Promise<VectorChunk[]> {
  const embedding = await embedQuery(query);
  const vectorLiteral = `[${embedding.join(',')}]`;

  const result = await pool.query(
    `SELECT
       chunk_id,
       product_name,
       manufacturer,
       product_category,
       document_type,
       section_type,
       source_file,
       chunk_text,
       token_count,
       1 - (embedding <=> $1::vector) AS similarity
     FROM document_chunks
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [vectorLiteral, topK]
  );

  return result.rows as VectorChunk[];
}
