import { pool } from './db';

export async function ensureTables(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id          SERIAL PRIMARY KEY,
      filename    TEXT NOT NULL,
      original_name TEXT NOT NULL,
      content     TEXT NOT NULL,
      metadata    JSONB NOT NULL DEFAULT '{}',
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id            SERIAL PRIMARY KEY,
      title         TEXT NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id                SERIAL PRIMARY KEY,
      session_id        INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
      content           TEXT NOT NULL,
      role              TEXT NOT NULL,
      sources           JSONB,
      word_count        INTEGER,
      processing_time_ms INTEGER,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS product_data (
      id            SERIAL PRIMARY KEY,
      system        TEXT NOT NULL,
      manufacturer  TEXT NOT NULL,
      membrane_type TEXT NOT NULL,
      thickness     TEXT,
      building_height TEXT,
      warranty      TEXT,
      wind_speed    TEXT,
      location      TEXT,
      contractor    TEXT,
      project_name  TEXT NOT NULL,
      date          TEXT,
      specifications JSONB NOT NULL DEFAULT '{}',
      source_document TEXT
    );
  `);
}
