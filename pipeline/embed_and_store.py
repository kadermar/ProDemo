"""
embed_and_store.py
==================
Embeds document chunks using OpenAI text-embedding-3-small and stores them
in a Neon PostgreSQL database with pgvector.

Usage:
    python embed_and_store.py [--dry-run] [--limit N] [--batch-size N]

Environment variables required:
    DATABASE_URL   - Neon PostgreSQL connection string
    OPENAI_API_KEY - OpenAI API key
    AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME
"""

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime
from typing import Any

import boto3
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from openai import OpenAI
from tqdm import tqdm

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536
CHUNKS_PREFIX = "chunks/"
BATCH_SIZE_DEFAULT = 512   # OpenAI supports up to 2048; 512 is safe & fast
TABLE_NAME = "document_chunks"


# ── DB helpers ─────────────────────────────────────────────────────────────────

def get_db_conn():
    url = os.environ["DATABASE_URL"]
    conn = psycopg2.connect(url)
    conn.autocommit = False
    return conn


def setup_schema(conn):
    """Enable pgvector and create document_chunks table if it doesn't exist."""
    with conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                chunk_id        TEXT PRIMARY KEY,
                product_name    TEXT,
                manufacturer    TEXT,
                product_category TEXT,
                document_type   TEXT,
                section_type    TEXT,
                source_file     TEXT,
                chunk_text      TEXT NOT NULL,
                token_count     INTEGER,
                is_table_chunk  BOOLEAN DEFAULT FALSE,
                embedding       vector({EMBEDDING_DIM}),
                embedded_at     TIMESTAMPTZ,
                created_at      TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        # Index for fast ANN search
        cur.execute(f"""
            CREATE INDEX IF NOT EXISTS {TABLE_NAME}_embedding_idx
            ON {TABLE_NAME} USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        """)
        conn.commit()
    log.info(f"Schema ready: table '{TABLE_NAME}' with vector({EMBEDDING_DIM}) column.")


def get_already_embedded_ids(conn) -> set[str]:
    """Return set of chunk_ids that already have embeddings."""
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT chunk_id FROM {TABLE_NAME} WHERE embedding IS NOT NULL;"
        )
        return {row[0] for row in cur.fetchall()}


def upsert_chunks_no_embedding(conn, chunks: list[dict]):
    """Insert chunk rows (without embeddings) — idempotent via ON CONFLICT DO NOTHING."""
    if not chunks:
        return
    rows = [
        (
            c["chunk_id"],
            c["metadata"].get("product_name"),
            c["metadata"].get("manufacturer"),
            c["metadata"].get("product_category"),
            c["metadata"].get("document_type"),
            c["metadata"].get("section_type"),
            c["metadata"].get("source_file"),
            c["chunk_text"],
            c["metadata"].get("token_count"),
            c["metadata"].get("is_table_chunk", False),
        )
        for c in chunks
    ]
    with conn.cursor() as cur:
        psycopg2.extras.execute_values(
            cur,
            f"""
            INSERT INTO {TABLE_NAME}
                (chunk_id, product_name, manufacturer, product_category,
                 document_type, section_type, source_file, chunk_text,
                 token_count, is_table_chunk)
            VALUES %s
            ON CONFLICT (chunk_id) DO NOTHING;
            """,
            rows,
        )
    conn.commit()


def update_embeddings(conn, chunk_ids: list[str], embeddings: list[list[float]]):
    """Write embeddings back to rows by chunk_id."""
    now = datetime.utcnow()
    rows = [
        (psycopg2.extras.Json(emb), now, cid)
        for cid, emb in zip(chunk_ids, embeddings)
    ]
    with conn.cursor() as cur:
        cur.executemany(
            f"""
            UPDATE {TABLE_NAME}
            SET embedding = %s::vector, embedded_at = %s
            WHERE chunk_id = %s;
            """,
            rows,
        )
    conn.commit()


# ── S3 helpers ─────────────────────────────────────────────────────────────────

def load_all_chunks(bucket: str, prefix: str, limit: int | None) -> list[dict]:
    """Download all chunk JSON files from S3 and flatten into a list of chunks."""
    s3 = boto3.client("s3")
    paginator = s3.get_paginator("list_objects_v2")
    keys = []
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            k = obj["Key"]
            if k.endswith(".json") and not k.endswith("chunking_report.json"):
                keys.append(k)

    log.info(f"Found {len(keys)} chunk files in s3://{bucket}/{prefix}")

    all_chunks: list[dict] = []
    for key in tqdm(keys, desc="Loading chunk files from S3"):
        resp = s3.get_object(Bucket=bucket, Key=key)
        doc = json.loads(resp["Body"].read())
        for chunk in doc.get("chunks", []):
            all_chunks.append(chunk)

    log.info(f"Loaded {len(all_chunks)} total chunks.")
    if limit:
        all_chunks = all_chunks[:limit]
        log.info(f"--limit: using first {len(all_chunks)} chunks.")
    return all_chunks


# ── Embedding ──────────────────────────────────────────────────────────────────

def embed_batch(client: OpenAI, texts: list[str], retries: int = 3) -> list[list[float]]:
    """Call OpenAI embeddings API with retry on rate-limit."""
    for attempt in range(retries):
        try:
            resp = client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=texts,
            )
            return [item.embedding for item in resp.data]
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** attempt * 5
                log.warning(f"Embedding API error ({e}), retrying in {wait}s…")
                time.sleep(wait)
            else:
                raise


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Embed chunks and store in pgvector.")
    parser.add_argument("--bucket", default=os.getenv("AWS_S3_BUCKET_NAME", "roofing-assistant-docs"))
    parser.add_argument("--chunks-prefix", default=CHUNKS_PREFIX)
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE_DEFAULT)
    parser.add_argument("--limit", type=int, default=None, help="Only embed first N chunks (for testing)")
    parser.add_argument("--dry-run", action="store_true", help="Load data and report counts, but don't call OpenAI or write to DB")
    args = parser.parse_args()

    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        log.error("OPENAI_API_KEY not set.")
        sys.exit(1)

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        log.error("DATABASE_URL not set.")
        sys.exit(1)

    # Load all chunks from S3
    all_chunks = load_all_chunks(args.bucket, args.chunks_prefix, args.limit)
    total = len(all_chunks)

    if args.dry_run:
        token_counts = [c["metadata"].get("token_count", 0) for c in all_chunks]
        total_tokens = sum(token_counts)
        estimated_cost = total_tokens / 1_000_000 * 0.02
        log.info(
            f"--dry-run: {total} chunks | {total_tokens:,} tokens | "
            f"~${estimated_cost:.4f} estimated cost (text-embedding-3-small)"
        )
        log.info("No DB writes or API calls made.")
        return

    # Connect to DB and set up schema
    conn = get_db_conn()
    setup_schema(conn)

    # Skip already-embedded chunks (resumable)
    done_ids = get_already_embedded_ids(conn)
    pending = [c for c in all_chunks if c["chunk_id"] not in done_ids]
    log.info(f"{len(done_ids)} already embedded, {len(pending)} remaining.")

    if not pending:
        log.info("All chunks already embedded. Nothing to do.")
        conn.close()
        return

    # Insert all chunk rows first (without embeddings) so we can update them later
    upsert_chunks_no_embedding(conn, pending)

    # Embed in batches
    client = OpenAI(api_key=openai_key)
    total_embedded = 0
    start = time.time()

    for i in tqdm(range(0, len(pending), args.batch_size), desc="Embedding batches"):
        batch = pending[i : i + args.batch_size]
        texts = [c["chunk_text"] for c in batch]
        ids = [c["chunk_id"] for c in batch]

        embeddings = embed_batch(client, texts)
        update_embeddings(conn, ids, embeddings)
        total_embedded += len(batch)

    elapsed = time.time() - start
    conn.close()

    log.info(
        f"Done. {total_embedded} chunks embedded in {elapsed:.1f}s "
        f"({total_embedded / elapsed:.1f} chunks/sec)."
    )

    # Write embedding report
    report = {
        "run_at": datetime.utcnow().isoformat(),
        "model": EMBEDDING_MODEL,
        "embedding_dim": EMBEDDING_DIM,
        "total_chunks_embedded": total_embedded,
        "elapsed_seconds": round(elapsed, 1),
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
