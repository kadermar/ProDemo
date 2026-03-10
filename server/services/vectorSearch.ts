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

export async function getProductLibrary(): Promise<ProductSheet[]> {
  if (productLibraryCache) return productLibraryCache;

  const result = await pool.query(`
    SELECT
      ROW_NUMBER() OVER (ORDER BY source_file) AS id,
      REGEXP_REPLACE(
        MIN(product_name),
        '^(?:material|Material)\s+(?:name|Name)\s*:\s*',
        ''
      ) AS product_name,
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
    product_name: r.product_name ?? '',
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
