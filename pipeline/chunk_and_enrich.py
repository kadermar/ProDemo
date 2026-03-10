"""Chunk parsed product JSON documents and build a product catalog.

Usage:
    python chunk_and_enrich.py [options]

See --help for full option list.
"""

import argparse
import datetime
import json
import logging
import os
import re
import statistics
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

try:
    import tiktoken

    _TOKENIZER = tiktoken.get_encoding("cl100k_base")
    _TIKTOKEN_AVAILABLE = True
except ImportError:
    _TOKENIZER = None
    _TIKTOKEN_AVAILABLE = False
    logger.warning(
        "tiktoken not installed. Token counts will use whitespace approximation. "
        "Install with: pip install tiktoken"
    )

TARGET_MIN = 50
TARGET_MAX = 500
SPLIT_THRESHOLD = 800

SPEC_PATTERNS: dict[str, str] = {
    "fire_rating": r"(?:fire\s+(?:class|rating))[:\s]+([A-Z][^\n,;]{0,40})",
    "wind_uplift": r"(?:wind\s+uplift)[:\s]+([\d,.\s]+\s*(?:psf|Pa|lbf/ft)[^\n]{0,30})",
    "thickness": r"(?:thickness)[:\s]+([\d./]+\s*(?:mil|mm|in\.?|inch)[^\n]{0,30})",
    "r_value": r"(?:R-?value|thermal\s+resistance)[:\s]+(R-?[\d.]+[^\n]{0,20})",
    "tensile_strength": r"(?:tensile\s+strength)[:\s]+([\d,]+\s*(?:lbf|N|psi|kN)[^\n]{0,30})",
}


def _count_tokens(text: str) -> int:
    """Count tokens using tiktoken cl100k_base, or whitespace split as fallback."""
    if _TIKTOKEN_AVAILABLE and _TOKENIZER is not None:
        return len(_TOKENIZER.encode(text))
    return len(text.split())


def _make_context_header(parsed_json: dict, section_type: str) -> str:
    """Build the context header string for a chunk."""
    return (
        f"Product: {parsed_json.get('product_name', '')} | "
        f"Manufacturer: {parsed_json.get('manufacturer', '')} | "
        f"Category: {parsed_json.get('product_category', '')} | "
        f"Section: {section_type}"
    )


def extract_key_specs(sections: list[dict]) -> dict:
    """Extract key technical specifications from Physical Properties and Technical Data sections.

    Args:
        sections: List of section dicts from a parsed document.

    Returns:
        Dict mapping spec name to extracted value string, or None if not found.
    """
    target_types = {"Physical Properties", "Technical Data"}
    combined_text = ""
    for section in sections:
        if section.get("section_type") in target_types:
            combined_text += " " + section.get("content", "")
            for table in section.get("tables", []):
                combined_text += " " + table.get("markdown", "")

    specs: dict[str, str | None] = {}
    for spec_name, pattern in SPEC_PATTERNS.items():
        match = re.search(pattern, combined_text, re.IGNORECASE)
        specs[spec_name] = match.group(1).strip() if match else None

    return specs


def _split_at_paragraphs(text: str, max_tokens: int) -> list[str]:
    """Split text at paragraph boundaries to stay under max_tokens per part.

    Args:
        text: Text to split.
        max_tokens: Hard token limit per part.

    Returns:
        List of text parts, each under max_tokens.
    """
    paragraphs = text.split("\n\n")
    parts: list[str] = []
    current_parts: list[str] = []
    current_tokens = 0

    for para in paragraphs:
        para_tokens = _count_tokens(para)
        if current_tokens + para_tokens > max_tokens and current_parts:
            parts.append("\n\n".join(current_parts))
            current_parts = [para]
            current_tokens = para_tokens
        else:
            current_parts.append(para)
            current_tokens += para_tokens

    if current_parts:
        parts.append("\n\n".join(current_parts))

    return [p for p in parts if p.strip()]


def process_document(parsed_json: dict) -> list[dict]:
    """Convert a parsed document dict into a list of chunks.

    Args:
        parsed_json: Parsed document dict as produced by parse_documents.py.

    Returns:
        List of chunk dicts, each with chunk_id, chunk_text, and metadata.
    """
    from utils.table_formatter import format_table as _format_table_unused  # noqa: F401
    from utils.text_cleaner import clean_text

    source_file = parsed_json.get("source_file", "unknown")
    stem = Path(os.path.basename(source_file)).stem
    sections = parsed_json.get("sections", [])

    product_name = parsed_json.get("product_name", "")
    manufacturer = parsed_json.get("manufacturer", "")
    product_category = parsed_json.get("product_category", "")
    document_type = parsed_json.get("document_type", "")

    # First pass: build all chunks with merge flags
    raw_chunks: list[dict] = []

    for sec_idx, section in enumerate(sections):
        section_type = section.get("section_type", "Other")
        raw_content = section.get("content", "")
        tables = section.get("tables", [])

        context_header = _make_context_header(parsed_json, section_type)
        cleaned_content = clean_text(raw_content)

        # ----------------------------------------------------------------
        # Table chunks (always isolated, one per table with data rows)
        # ----------------------------------------------------------------
        for tbl in tables:
            markdown = tbl.get("markdown", "").strip()
            data = tbl.get("data", [])
            if not markdown or len(data) == 0:
                continue
            chunk_text = context_header + "\n\n" + markdown
            token_count = _count_tokens(chunk_text)
            raw_chunks.append(
                {
                    "chunk_id": f"{stem}_{sec_idx}_table_{len(raw_chunks)}",
                    "chunk_text": chunk_text,
                    "metadata": {
                        "product_name": product_name,
                        "manufacturer": manufacturer,
                        "product_category": product_category,
                        "document_type": document_type,
                        "section_type": section_type,
                        "source_file": source_file,
                        "token_count": token_count,
                        "is_table_chunk": True,
                    },
                    "_merge": False,
                    "_is_table": True,
                }
            )

        # ----------------------------------------------------------------
        # Text chunk(s)
        # ----------------------------------------------------------------
        if not cleaned_content.strip():
            continue

        full_text = context_header + "\n\n" + cleaned_content
        token_count = _count_tokens(full_text)

        is_last_section = sec_idx == len(sections) - 1
        mark_for_merge = token_count < TARGET_MIN and not is_last_section

        if token_count <= SPLIT_THRESHOLD:
            raw_chunks.append(
                {
                    "chunk_id": f"{stem}_{sec_idx}",
                    "chunk_text": full_text,
                    "metadata": {
                        "product_name": product_name,
                        "manufacturer": manufacturer,
                        "product_category": product_category,
                        "document_type": document_type,
                        "section_type": section_type,
                        "source_file": source_file,
                        "token_count": token_count,
                        "is_table_chunk": False,
                    },
                    "_merge": mark_for_merge,
                    "_is_table": False,
                }
            )
        else:
            # Split at paragraph boundaries
            parts = _split_at_paragraphs(full_text, SPLIT_THRESHOLD)
            for part_idx, part in enumerate(parts):
                part_token_count = _count_tokens(part)
                # Prepend context_header if it was split away
                if not part.startswith("Product:"):
                    part = context_header + "\n\n" + part
                    part_token_count = _count_tokens(part)
                raw_chunks.append(
                    {
                        "chunk_id": f"{stem}_{sec_idx}_part{part_idx + 1}",
                        "chunk_text": part,
                        "metadata": {
                            "product_name": product_name,
                            "manufacturer": manufacturer,
                            "product_category": product_category,
                            "document_type": document_type,
                            "section_type": section_type,
                            "source_file": source_file,
                            "token_count": part_token_count,
                            "is_table_chunk": False,
                        },
                        "_merge": False,
                        "_is_table": False,
                    }
                )

    # ----------------------------------------------------------------
    # Post-processing: merge small text chunks with next text chunk
    # ----------------------------------------------------------------
    merged_chunks: list[dict] = []
    skip_next = False

    for i, chunk in enumerate(raw_chunks):
        if skip_next:
            skip_next = False
            continue

        if (
            chunk.get("_merge")
            and not chunk.get("_is_table")
            and i + 1 < len(raw_chunks)
            and not raw_chunks[i + 1].get("_is_table")
        ):
            next_chunk = raw_chunks[i + 1]
            # Combine section types
            merged_section_type = (
                chunk["metadata"]["section_type"]
                + " / "
                + next_chunk["metadata"]["section_type"]
            )
            # Combine text (avoid duplicate context headers)
            combined_text = chunk["chunk_text"] + "\n\n" + next_chunk["chunk_text"]
            combined_tokens = _count_tokens(combined_text)

            merged = {
                "chunk_id": chunk["chunk_id"],
                "chunk_text": combined_text,
                "metadata": {
                    **chunk["metadata"],
                    "section_type": merged_section_type,
                    "token_count": combined_tokens,
                },
                "_merge": False,
                "_is_table": False,
            }
            merged_chunks.append(merged)
            skip_next = True
        else:
            merged_chunks.append(chunk)

    # Strip internal keys and return
    final_chunks: list[dict] = []
    for chunk in merged_chunks:
        final_chunks.append(
            {
                "chunk_id": chunk["chunk_id"],
                "chunk_text": chunk["chunk_text"],
                "metadata": chunk["metadata"],
            }
        )

    return final_chunks


def build_catalog(all_results: list[dict]) -> dict:
    """Build a deduplicated product catalog from all chunked document results.

    Deduplicates by product_name (case-insensitive). When the same product
    appears in multiple source files, retains the entry with the most chunks.

    Args:
        all_results: List of per-document result dicts with keys:
            parsed_json, chunks, key_specs.

    Returns:
        Catalog dict with products list, generated_at timestamp, and total count.
    """
    # Map normalized name -> best result so far
    best_by_name: dict[str, dict] = {}

    for result in all_results:
        parsed = result.get("parsed_json", {})
        chunks = result.get("chunks", [])
        key_specs = result.get("key_specs", {})
        name = parsed.get("product_name", "").strip().lower()

        entry = {
            "product_name": parsed.get("product_name", ""),
            "manufacturer": parsed.get("manufacturer", ""),
            "product_category": parsed.get("product_category", ""),
            "document_type": parsed.get("document_type", ""),
            "source_file": parsed.get("source_file", ""),
            "chunk_count": len(chunks),
            "key_specs": key_specs,
            "extraction_quality": parsed.get("extraction_quality", ""),
        }

        if name not in best_by_name or len(chunks) > best_by_name[name]["chunk_count"]:
            best_by_name[name] = entry

    products = list(best_by_name.values())
    return {
        "products": products,
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "total_products": len(products),
    }


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------


def generate_chunking_report(
    all_results: list[dict],
    start_time: datetime.datetime,
    catalog: dict,
    zero_chunk_docs: list[str],
) -> dict:
    """Build the chunking report dict."""
    all_chunks = [c for r in all_results for c in r.get("chunks", [])]
    token_counts = [c["metadata"]["token_count"] for c in all_chunks]
    table_chunks = sum(1 for c in all_chunks if c["metadata"].get("is_table_chunk"))
    text_chunks = len(all_chunks) - table_chunks

    token_stats: dict = {}
    if token_counts:
        token_stats = {
            "min": min(token_counts),
            "max": max(token_counts),
            "mean": round(sum(token_counts) / len(token_counts), 2),
            "median": statistics.median(token_counts),
        }
    else:
        token_stats = {"min": 0, "max": 0, "mean": 0.0, "median": 0}

    n_docs = len(all_results)
    return {
        "run_at": start_time.isoformat(),
        "total_documents": n_docs,
        "total_chunks": len(all_chunks),
        "avg_chunks_per_document": round(len(all_chunks) / n_docs, 2) if n_docs else 0.0,
        "token_stats": token_stats,
        "zero_chunk_documents": zero_chunk_docs,
        "total_unique_products": catalog.get("total_products", 0),
        "table_chunks": table_chunks,
        "text_chunks": text_chunks,
    }


# ---------------------------------------------------------------------------
# I/O helpers
# ---------------------------------------------------------------------------


def _load_parsed_jsons_local(prefix_filter: str | None) -> list[tuple[str, dict]]:
    """Load all parsed JSON files from ./local_output/parsed/."""
    parsed_dir = Path("./local_output/parsed")
    parsed_dir.mkdir(parents=True, exist_ok=True)
    results = []
    for p in parsed_dir.glob("*.json"):
        if p.name == "parsing_report.json":
            continue
        if prefix_filter and prefix_filter not in str(p):
            continue
        try:
            with open(p, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            results.append((str(p), data))
        except Exception as exc:
            logger.warning("Failed to load %s: %s", p, exc)
    return results


def _load_parsed_jsons_s3(
    bucket: str, prefix: str, prefix_filter: str | None
) -> list[tuple[str, dict]]:
    """Load all parsed JSON files from S3."""
    from utils.s3_client import download_json, list_json_keys

    keys = list_json_keys(bucket, prefix)
    results = []
    for key in keys:
        if Path(key).name == "parsing_report.json":
            continue
        if prefix_filter and prefix_filter not in key:
            continue
        try:
            data = download_json(bucket, key)
            results.append((key, data))
        except Exception as exc:
            logger.warning("Failed to load s3://%s/%s: %s", bucket, key, exc)
    return results


def _save_chunk_file_local(stem: str, payload: dict) -> None:
    out_dir = Path("./local_output/chunks")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{stem}.json"
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)


def _save_chunk_file_s3(bucket: str, output_prefix: str, stem: str, payload: dict) -> None:
    from utils.s3_client import upload_json

    s3_key = output_prefix.rstrip("/") + "/" + stem + ".json"
    upload_json(bucket, s3_key, payload)


def _save_json_local(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)


def _save_json_s3(bucket: str, key: str, data: dict) -> None:
    from utils.s3_client import upload_json

    upload_json(bucket, key, data)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Chunk parsed product JSON and build a catalog.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--bucket", default="roofing-assistant-docs", help="S3 bucket name.")
    parser.add_argument(
        "--input-prefix", default="parsed/", help="S3 prefix for parsed JSON."
    )
    parser.add_argument(
        "--output-prefix", default="chunks/", help="S3 prefix for chunk output."
    )
    parser.add_argument(
        "--catalog-prefix", default="catalog/", help="S3 prefix for catalog output."
    )
    parser.add_argument("--dry-run", action="store_true", help="Process only first 10 documents.")
    parser.add_argument(
        "--local",
        action="store_true",
        help="Read from ./local_output/parsed/, write to ./local_output/chunks/ and catalog/.",
    )
    parser.add_argument(
        "--prefix", default=None, help="Only process keys/paths containing this substring."
    )
    parser.add_argument(
        "--skip-existing", action="store_true", help="Skip documents already chunked."
    )
    return parser.parse_args()


def _get_existing_chunk_stems(args: argparse.Namespace) -> set[str]:
    """Return stems of already-chunked documents."""
    existing: set[str] = set()
    if not args.skip_existing:
        return existing
    if args.local:
        chunk_dir = Path("./local_output/chunks")
        if chunk_dir.exists():
            for p in chunk_dir.glob("*.json"):
                existing.add(p.stem)
    else:
        from utils.s3_client import list_json_keys

        keys = list_json_keys(args.bucket, args.output_prefix)
        for k in keys:
            existing.add(Path(k).stem)
    logger.info("Skip-existing: %d chunks already present.", len(existing))
    return existing


def main() -> None:
    args = parse_args()
    start_time = datetime.datetime.utcnow()

    # ----------------------------------------------------------------
    # Load parsed JSONs
    # ----------------------------------------------------------------
    if args.local:
        doc_pairs = _load_parsed_jsons_local(args.prefix)
    else:
        doc_pairs = _load_parsed_jsons_s3(args.bucket, args.input_prefix, args.prefix)

    logger.info("Loaded %d parsed documents.", len(doc_pairs))

    # Skip existing
    existing_stems = _get_existing_chunk_stems(args)
    if existing_stems:
        before = len(doc_pairs)
        doc_pairs = [
            (k, d) for k, d in doc_pairs
            if Path(os.path.basename(k)).stem not in existing_stems
        ]
        logger.info("Skipped %d already-chunked documents.", before - len(doc_pairs))

    # Dry-run limit
    if args.dry_run:
        doc_pairs = doc_pairs[:10]
        logger.info("--dry-run: limiting to %d documents.", len(doc_pairs))

    if not doc_pairs:
        logger.info("Nothing to process. Exiting.")
        return

    # ----------------------------------------------------------------
    # Process each document
    # ----------------------------------------------------------------
    all_results: list[dict] = []
    zero_chunk_docs: list[str] = []
    processed_count = 0

    for key, parsed_json in doc_pairs:
        stem = Path(os.path.basename(key)).stem
        try:
            chunks = process_document(parsed_json)
            key_specs = extract_key_specs(parsed_json.get("sections", []))

            if not chunks:
                zero_chunk_docs.append(key)
                logger.warning("No chunks produced for %s", key)

            payload = {
                "source_file": parsed_json.get("source_file", key),
                "product_name": parsed_json.get("product_name", ""),
                "manufacturer": parsed_json.get("manufacturer", ""),
                "product_category": parsed_json.get("product_category", ""),
                "document_type": parsed_json.get("document_type", ""),
                "key_specs": key_specs,
                "chunk_count": len(chunks),
                "chunks": chunks,
            }

            if args.local:
                _save_chunk_file_local(stem, payload)
            else:
                _save_chunk_file_s3(args.bucket, args.output_prefix, stem, payload)

            all_results.append(
                {
                    "parsed_json": parsed_json,
                    "chunks": chunks,
                    "key_specs": key_specs,
                    "key": key,
                }
            )

        except Exception as exc:
            logger.error("Failed to chunk %s: %s", key, exc, exc_info=True)
            zero_chunk_docs.append(key)
            all_results.append(
                {
                    "parsed_json": parsed_json,
                    "chunks": [],
                    "key_specs": {},
                    "key": key,
                }
            )

        processed_count += 1
        if processed_count % 50 == 0:
            logger.info("Progress: %d / %d documents chunked.", processed_count, len(doc_pairs))

    logger.info(
        "Chunking complete. %d documents processed, %d zero-chunk.",
        processed_count,
        len(zero_chunk_docs),
    )

    # ----------------------------------------------------------------
    # Build and save catalog
    # ----------------------------------------------------------------
    catalog = build_catalog(all_results)

    if args.local:
        catalog_dir = Path("./local_output/catalog")
        catalog_dir.mkdir(parents=True, exist_ok=True)
        catalog_path = catalog_dir / "product_catalog.json"
        _save_json_local(catalog_path, catalog)
        logger.info("Saved catalog -> %s (%d products)", catalog_path, catalog["total_products"])
    else:
        catalog_key = args.catalog_prefix.rstrip("/") + "/product_catalog.json"
        _save_json_s3(args.bucket, catalog_key, catalog)
        logger.info(
            "Uploaded catalog -> s3://%s/%s (%d products)",
            args.bucket,
            catalog_key,
            catalog["total_products"],
        )

    # ----------------------------------------------------------------
    # Build and save chunking report
    # ----------------------------------------------------------------
    report = generate_chunking_report(all_results, start_time, catalog, zero_chunk_docs)

    if args.local:
        report_path = Path("./local_output/chunks/chunking_report.json")
        _save_json_local(report_path, report)
        logger.info("Saved chunking report -> %s", report_path)
    else:
        report_key = args.output_prefix.rstrip("/") + "/chunking_report.json"
        _save_json_s3(args.bucket, report_key, report)
        logger.info(
            "Uploaded chunking report -> s3://%s/%s", args.bucket, report_key
        )

    # Print summary
    logger.info(
        "Summary: %d total chunks | %d unique products | %d zero-chunk docs",
        report["total_chunks"],
        report["total_unique_products"],
        len(zero_chunk_docs),
    )


if __name__ == "__main__":
    main()
