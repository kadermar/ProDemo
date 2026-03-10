# ProductLibraryAI — Document Parsing & Chunking Pipeline

## Overview

This pipeline processes roofing product PDF documents from S3 (or a local directory) in two stages:

1. **`parse_documents.py`** — Downloads PDFs, uses [Unstructured](https://github.com/Unstructured-IO/unstructured) to extract text and tables, classifies metadata (product name, manufacturer, category, document type), segments content into logical sections, and writes structured JSON to S3 or local disk.

2. **`chunk_and_enrich.py`** — Loads the parsed JSONs, splits each section into token-bounded chunks suitable for embedding, extracts key technical specifications (fire rating, R-value, thickness, etc.), builds a deduplicated product catalog, and writes chunk JSON files plus a summary report.

---

## Prerequisites

### Python

Python **3.11 or newer** is required.

### System Dependencies

Some Unstructured strategies require native libraries:

```bash
# macOS (Homebrew)
brew install poppler tesseract

# Ubuntu / Debian
sudo apt-get install -y poppler-utils tesseract-ocr
```

- **poppler** — required for `fast` and `auto` strategies (PDF → image conversion)
- **tesseract** — required for `hi_res` and `ocr_only` strategies (OCR)

> The `fast` strategy does **not** require tesseract. Only install it if you plan to use `hi_res` or `ocr_only`.

---

## Installation

```bash
cd /Users/kadermar/ProductLibraryAI/pipeline

# Create a virtual environment (recommended)
python3.11 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

---

## AWS Credentials

The pipeline uses `boto3` and reads credentials from the standard AWS credential chain:

- `~/.aws/credentials` (recommended for local development)
- Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`
- IAM instance role (when running on EC2/ECS)

Minimum required IAM permissions:

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
  "Resource": [
    "arn:aws:s3:::roofing-assistant-docs",
    "arn:aws:s3:::roofing-assistant-docs/*"
  ]
}
```

---

## Directory Structure

```
pipeline/
├── parse_documents.py      # Stage 1: PDF → structured JSON
├── chunk_and_enrich.py     # Stage 2: JSON → chunks + catalog
├── requirements.txt
├── README.md
├── utils/
│   ├── __init__.py
│   ├── s3_client.py        # S3 upload/download helpers
│   ├── metadata_extractor.py  # Product name, manufacturer, category, doc type
│   ├── section_segmenter.py   # Heading-based section segmentation
│   ├── table_formatter.py     # HTML table → markdown / dict
│   └── text_cleaner.py        # OCR artifact fixes, whitespace normalization
└── local_output/           # Created automatically when --local is used
    ├── pdfs/               # Place local PDFs here for --local runs
    ├── parsed/             # Stage 1 output
    ├── chunks/             # Stage 2 output
    └── catalog/            # Product catalog output
```

---

## Running `parse_documents.py`

### All Options

| Flag | Default | Description |
|---|---|---|
| `--bucket` | `roofing-assistant-docs` | S3 bucket name |
| `--input-prefix` | `raw-docs/product-data-sheets/` | S3 prefix for raw PDFs |
| `--output-prefix` | `parsed/` | S3 prefix for parsed JSON |
| `--strategy` | `auto` | Unstructured strategy: `auto`, `fast`, `hi_res`, `ocr_only` |
| `--workers` | `4` | Parallel worker processes |
| `--dry-run` | off | Process only the first 10 documents |
| `--local` | off | Use `./local_output/pdfs/` and `./local_output/parsed/` |
| `--prefix` | none | Only process keys/paths containing this substring |
| `--benchmark` | off | Time `fast` vs `hi_res` on one document, then exit |
| `--skip-existing` | off | Skip documents already parsed |

### Examples

```bash
# Benchmark fast vs hi_res on your first document
python parse_documents.py --benchmark

# Dry-run against S3 with auto strategy
python parse_documents.py --dry-run

# Full S3 run with hi_res strategy, 8 workers
python parse_documents.py --strategy hi_res --workers 8

# Process only Carlisle documents
python parse_documents.py --prefix Carlisle

# Local test run (place PDFs in ./local_output/pdfs/)
python parse_documents.py --local --dry-run

# Skip documents already parsed (for resuming an interrupted run)
python parse_documents.py --skip-existing
```

---

## Running `chunk_and_enrich.py`

### All Options

| Flag | Default | Description |
|---|---|---|
| `--bucket` | `roofing-assistant-docs` | S3 bucket name |
| `--input-prefix` | `parsed/` | S3 prefix for parsed JSON input |
| `--output-prefix` | `chunks/` | S3 prefix for chunk output |
| `--catalog-prefix` | `catalog/` | S3 prefix for catalog output |
| `--dry-run` | off | Process only the first 10 documents |
| `--local` | off | Use local `./local_output/` directories |
| `--prefix` | none | Only process keys/paths containing this substring |
| `--skip-existing` | off | Skip documents already chunked |

### Examples

```bash
# Dry-run against S3 parsed output
python chunk_and_enrich.py --dry-run

# Full S3 run
python chunk_and_enrich.py

# Local run after a local parse
python chunk_and_enrich.py --local

# Process only a single manufacturer
python chunk_and_enrich.py --prefix Firestone

# Resume an interrupted run
python chunk_and_enrich.py --skip-existing
```

---

## Recommended Workflow

Follow these steps for a safe first run:

**1. Benchmark strategy selection**

```bash
python parse_documents.py --benchmark
```

This runs one document through both `fast` and `hi_res` and prints a comparison. Use the recommendation to choose your strategy for the full run.

**2. Validate locally with a dry-run**

Place a handful of PDFs in `./local_output/pdfs/`, then:

```bash
python parse_documents.py --dry-run --local
```

Inspect the JSON files written to `./local_output/parsed/` and the `parsing_report.json`.

**3. Full parse run**

```bash
python parse_documents.py --strategy auto --workers 6
```

Monitor the log output. Check `parsing_report.json` in S3 after completion.

**4. Chunk dry-run**

```bash
python chunk_and_enrich.py --dry-run
```

Review a few chunk files and verify token counts and section boundaries.

**5. Full chunk run**

```bash
python chunk_and_enrich.py
```

After completion, review `chunking_report.json` and `catalog/product_catalog.json`.

---

## Expected Outputs

### Stage 1 — `parsed/{stem}.json`

```json
{
  "source_file": "raw-docs/product-data-sheets/Carlisle_TPO_Membrane.pdf",
  "product_name": "TPO Membrane",
  "manufacturer": "Carlisle",
  "product_category": "membrane",
  "document_type": "product data sheet",
  "extraction_quality": "good",
  "review_flags": [],
  "sections": [
    {
      "section_type": "Product Description",
      "heading": "Product Description",
      "content": "...",
      "tables": []
    }
  ],
  "element_count": 142
}
```

### Stage 1 — `parsed/parsing_report.json`

Summary of the parse run: counts by status, category distribution, doc type distribution, and lists of documents needing review or that failed.

### Stage 2 — `chunks/{stem}.json`

```json
{
  "source_file": "...",
  "product_name": "TPO Membrane",
  "chunk_count": 8,
  "key_specs": {
    "fire_rating": "Class A",
    "thickness": "60 mil",
    "r_value": null
  },
  "chunks": [
    {
      "chunk_id": "Carlisle_TPO_Membrane_0",
      "chunk_text": "Product: TPO Membrane | Manufacturer: Carlisle | ...\n\n...",
      "metadata": {
        "product_name": "TPO Membrane",
        "manufacturer": "Carlisle",
        "product_category": "membrane",
        "document_type": "product data sheet",
        "section_type": "Product Description",
        "source_file": "...",
        "token_count": 187,
        "is_table_chunk": false
      }
    }
  ]
}
```

### Stage 2 — `catalog/product_catalog.json`

Deduplicated catalog of unique products across all documents, with key specs.

### Stage 2 — `chunks/chunking_report.json`

Token statistics, chunk counts, zero-chunk document list, and table vs text chunk breakdown.

---

## Troubleshooting

### `tesseract: command not found`

The `hi_res` and `ocr_only` strategies require Tesseract OCR. Install it:

```bash
# macOS
brew install tesseract

# Ubuntu
sudo apt-get install -y tesseract-ocr
```

If you only need native-text PDFs, use `--strategy fast` which does not require Tesseract.

### `poppler not found` / `pdfinfo not found`

Install poppler:

```bash
# macOS
brew install poppler

# Ubuntu
sudo apt-get install -y poppler-utils
```

### Memory errors / OOM with `hi_res`

`hi_res` renders each PDF page as a high-resolution image before OCR, which is memory-intensive. Mitigations:

- Reduce `--workers` (try `--workers 2` or even `--workers 1`)
- Use `--strategy fast` for large batches and `hi_res` only for specific problem documents
- Increase the memory available to your instance

### Very few elements extracted (`auto` falls back to `ocr_only`)

This is expected for scanned PDFs. The pipeline detects this automatically (fewer than 10 elements on a multi-page document) and retries with `ocr_only`. The document will be flagged as `fallback_used` in the report.

### `boto3.exceptions.NoCredentialsError`

AWS credentials are not configured. See the [AWS Credentials](#aws-credentials) section above.

### `ModuleNotFoundError: No module named 'unstructured'`

Run `pip install 'unstructured[pdf]'` inside your virtual environment.

### Chunks have very low token counts

If many chunks are below `TARGET_MIN` (50 tokens), the documents may be very short or poorly structured. Check `parsing_report.json` for documents with `extraction_quality: needs_review` and inspect the source PDFs.
