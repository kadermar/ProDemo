"""Parse PDF product documents from S3 (or local) into structured JSON.

Usage:
    python parse_documents.py [options]

See --help for full option list.
"""

import argparse
import datetime
import json
import logging
import os
import shutil
import sys
import tempfile
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

try:
    from unstructured.partition.pdf import partition_pdf as _partition_pdf

    _UNSTRUCTURED_AVAILABLE = True
except ImportError:
    _UNSTRUCTURED_AVAILABLE = False
    logger.error(
        "unstructured is not installed. Install with: pip install 'unstructured[pdf]'"
    )

# ---------------------------------------------------------------------------
# Top-level worker function (must be top-level for ProcessPoolExecutor pickling)
# ---------------------------------------------------------------------------


def process_document(key_or_path: str, args: dict) -> dict:
    """Parse a single PDF and write the structured JSON output.

    This is a top-level function so it can be pickled by ProcessPoolExecutor.

    Args:
        key_or_path: S3 key or local file path of the source PDF.
        args: Namespace-equivalent dict of CLI arguments.

    Returns:
        Result dict describing parsing outcome, metadata, and any flags.
    """
    # Inline imports so the worker subprocess re-imports cleanly
    import logging as _logging
    import os as _os
    import shutil as _shutil
    import tempfile as _tempfile
    from pathlib import Path as _Path

    _logger = _logging.getLogger(__name__)

    stem = _Path(_os.path.basename(key_or_path)).stem
    result: dict = {
        "key": key_or_path,
        "status": "ok",
        "flags": [],
        "error": None,
        "product_name": "",
        "manufacturer": "",
        "category": "",
        "doc_type": "",
    }

    tmp_dir = _tempfile.mkdtemp(prefix="parse_doc_")
    try:
        # ----------------------------------------------------------------
        # 1. Obtain local PDF path
        # ----------------------------------------------------------------
        if args.get("local"):
            local_pdf = key_or_path
        else:
            from utils.s3_client import download_to_temp

            local_pdf = download_to_temp(args["bucket"], key_or_path, tmp_dir)

        # ----------------------------------------------------------------
        # 2. Partition PDF
        # ----------------------------------------------------------------
        if not _UNSTRUCTURED_AVAILABLE:
            raise ImportError(
                "unstructured is not installed. Cannot partition PDF."
            )

        from unstructured.partition.pdf import partition_pdf

        strategy = args.get("strategy", "auto")
        _logger.info("Partitioning %s with strategy=%s", stem, strategy)
        elements = partition_pdf(local_pdf, strategy=strategy)

        # Fallback: if auto produced very few elements on a multi-page doc
        if strategy == "auto" and len(elements) < 10:
            try:
                import pikepdf

                doc = pikepdf.open(local_pdf)
                page_count = len(doc.pages)
                doc.close()
            except Exception:
                page_count = 2  # assume multi-page if we can't check

            if page_count > 1:
                _logger.warning(
                    "%s: only %d elements with strategy=auto, retrying with ocr_only",
                    stem,
                    len(elements),
                )
                elements = partition_pdf(local_pdf, strategy="ocr_only")
                result["status"] = "fallback_used"
                result["flags"].append("auto_fell_back_to_ocr_only")

        # ----------------------------------------------------------------
        # 3. Extract metadata
        # ----------------------------------------------------------------
        from utils.metadata_extractor import (
            classify_document_type,
            classify_product_category,
            extract_manufacturer,
            extract_product_name,
        )

        filename = _os.path.basename(key_or_path)

        product_name, pn_review = extract_product_name(elements, filename)
        manufacturer, mfr_review = extract_manufacturer(elements, filename)
        category, cat_review = classify_product_category(elements)
        doc_type, dt_review = classify_document_type(elements, filename)

        if pn_review:
            result["flags"].append("product_name_needs_review")
        if mfr_review:
            result["flags"].append("manufacturer_needs_review")
        if cat_review:
            result["flags"].append("category_needs_review")
        if dt_review:
            result["flags"].append("doc_type_needs_review")

        result["product_name"] = product_name
        result["manufacturer"] = manufacturer
        result["category"] = category
        result["doc_type"] = doc_type

        # ----------------------------------------------------------------
        # 4. Segment sections
        # ----------------------------------------------------------------
        from utils.section_segmenter import segment_into_sections

        sections = segment_into_sections(elements)

        # ----------------------------------------------------------------
        # 5. Build output JSON
        # ----------------------------------------------------------------
        extraction_quality = "needs_review" if result["flags"] else "good"

        output = {
            "source_file": key_or_path,
            "product_name": product_name,
            "manufacturer": manufacturer,
            "product_category": category,
            "document_type": doc_type,
            "extraction_quality": extraction_quality,
            "review_flags": result["flags"],
            "sections": sections,
            "element_count": len(elements),
        }

        # ----------------------------------------------------------------
        # 6. Save output
        # ----------------------------------------------------------------
        out_key = stem + ".json"
        if args.get("local"):
            out_dir = _Path("./local_output/parsed")
            out_dir.mkdir(parents=True, exist_ok=True)
            out_path = out_dir / out_key
            with open(out_path, "w", encoding="utf-8") as fh:
                import json as _json

                fh.write(_json.dumps(output, indent=2, ensure_ascii=False))
            _logger.info("Saved parsed JSON -> %s", out_path)
        else:
            from utils.s3_client import upload_json

            s3_key = args["output_prefix"].rstrip("/") + "/" + out_key
            upload_json(args["bucket"], s3_key, output)
            _logger.info("Uploaded parsed JSON -> s3://%s/%s", args["bucket"], s3_key)

    except Exception as exc:
        _logger.error("Failed to process %s: %s", key_or_path, exc, exc_info=True)
        result["status"] = "failed"
        result["error"] = str(exc)
    finally:
        _shutil.rmtree(tmp_dir, ignore_errors=True)

    return result


# ---------------------------------------------------------------------------
# Benchmark mode
# ---------------------------------------------------------------------------


def benchmark_mode(args: argparse.Namespace) -> None:
    """Run a single document through 'fast' and 'hi_res', print comparison."""
    if not _UNSTRUCTURED_AVAILABLE:
        logger.error("unstructured is not installed. Cannot run benchmark.")
        sys.exit(1)

    from unstructured.partition.pdf import partition_pdf

    # Obtain first PDF
    if args.local:
        local_dir = Path("./local_output/pdfs")
        pdfs = list(local_dir.glob("*.pdf"))
        if not pdfs:
            logger.error("No PDFs found in ./local_output/pdfs/")
            sys.exit(1)
        local_pdf = str(pdfs[0])
        label = pdfs[0].name
    else:
        from utils.s3_client import list_pdf_keys

        keys = list_pdf_keys(args.bucket, args.input_prefix)
        if not keys:
            logger.error(
                "No PDFs found in s3://%s/%s", args.bucket, args.input_prefix
            )
            sys.exit(1)
        tmp_dir = tempfile.mkdtemp(prefix="benchmark_")
        try:
            from utils.s3_client import download_to_temp

            local_pdf = download_to_temp(args.bucket, keys[0], tmp_dir)
        except Exception as exc:
            logger.error("Failed to download benchmark PDF: %s", exc)
            shutil.rmtree(tmp_dir, ignore_errors=True)
            sys.exit(1)
        label = keys[0]

    results: dict[str, dict] = {}
    for strategy in ("fast", "hi_res"):
        logger.info("Running benchmark with strategy=%s ...", strategy)
        t_start = time.perf_counter()
        try:
            elements = partition_pdf(local_pdf, strategy=strategy)
        except Exception as exc:
            logger.error("strategy=%s failed: %s", strategy, exc)
            results[strategy] = {"error": str(exc)}
            continue
        elapsed = time.perf_counter() - t_start

        table_count = sum(
            1 for el in elements if type(el).__name__ == "Table"
        )
        type_counts: dict[str, int] = {}
        for el in elements:
            t = type(el).__name__
            type_counts[t] = type_counts.get(t, 0) + 1

        results[strategy] = {
            "time_seconds": round(elapsed, 2),
            "element_count": len(elements),
            "table_count": table_count,
            "element_types": type_counts,
        }

    # Print comparison
    print("\n" + "=" * 60)
    print(f"BENCHMARK RESULTS — {label}")
    print("=" * 60)
    header = f"{'Metric':<30} {'fast':>12} {'hi_res':>12}"
    print(header)
    print("-" * 60)

    metrics = ["time_seconds", "element_count", "table_count"]
    labels = ["Time (seconds)", "Element count", "Table count"]
    for metric, label_str in zip(metrics, labels):
        fast_val = results.get("fast", {}).get(metric, "ERROR")
        hires_val = results.get("hi_res", {}).get(metric, "ERROR")
        print(f"{label_str:<30} {str(fast_val):>12} {str(hires_val):>12}")

    print("-" * 60)
    print("Element types breakdown:")
    all_types: set[str] = set()
    for r in results.values():
        all_types.update(r.get("element_types", {}).keys())
    for et in sorted(all_types):
        f_count = results.get("fast", {}).get("element_types", {}).get(et, 0)
        h_count = results.get("hi_res", {}).get("element_types", {}).get(et, 0)
        print(f"  {et:<28} {f_count:>12} {h_count:>12}")

    print("=" * 60)

    # Recommendation
    fast_els = results.get("fast", {}).get("element_count", 0)
    hires_els = results.get("hi_res", {}).get("element_count", 0)
    fast_time = results.get("fast", {}).get("time_seconds", 999)
    hires_time = results.get("hi_res", {}).get("time_seconds", 999)

    print("\nRECOMMENDATION:")
    if isinstance(fast_els, int) and isinstance(hires_els, int):
        ratio = hires_els / fast_els if fast_els > 0 else 0
        if ratio >= 1.5:
            print(
                f"  hi_res extracts {ratio:.1f}x more elements and is recommended "
                f"despite being {hires_time / fast_time:.1f}x slower."
            )
        else:
            print(
                f"  fast strategy extracts nearly as many elements ({ratio:.2f}x ratio) "
                f"and is {hires_time / fast_time:.1f}x faster — recommended for bulk runs."
            )
    else:
        print("  Could not compute recommendation due to errors.")
    print()

    if not args.local:
        shutil.rmtree(tmp_dir, ignore_errors=True)


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------


def generate_report(
    results: list[dict],
    args: argparse.Namespace,
    start_time: datetime.datetime,
) -> dict:
    """Build the parsing report dict from all worker results."""
    ok = [r for r in results if r["status"] == "ok"]
    fallback = [r for r in results if r["status"] == "fallback_used"]
    failed = [r for r in results if r["status"] == "failed"]
    needs_review = [r for r in results if r.get("flags")]

    category_dist: dict[str, int] = {}
    doctype_dist: dict[str, int] = {}
    for r in results:
        cat = r.get("category", "unknown")
        category_dist[cat] = category_dist.get(cat, 0) + 1
        dt = r.get("doc_type", "unknown")
        doctype_dist[dt] = doctype_dist.get(dt, 0) + 1

    return {
        "run_at": start_time.isoformat(),
        "strategy_used": args.strategy,
        "total_processed": len(results),
        "total_ok": len(ok) + len(fallback),
        "total_fallback": len(fallback),
        "total_failed": len(failed),
        "needs_review": len(needs_review),
        "review_details": [
            {"key": r["key"], "flags": r["flags"]}
            for r in needs_review
        ],
        "failed_details": [
            {"key": r["key"], "error": r.get("error", "")}
            for r in failed
        ],
        "category_distribution": category_dist,
        "doctype_distribution": doctype_dist,
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Parse PDF product documents into structured JSON.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--bucket",
        default="roofing-assistant-docs",
        help="S3 bucket name.",
    )
    parser.add_argument(
        "--input-prefix",
        default="raw-docs/product-data-sheets/",
        help="S3 prefix for raw PDFs.",
    )
    parser.add_argument(
        "--output-prefix",
        default="parsed/",
        help="S3 prefix for parsed JSON output.",
    )
    parser.add_argument(
        "--strategy",
        default="auto",
        choices=["auto", "fast", "hi_res", "ocr_only"],
        help="Unstructured partition strategy.",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Number of parallel worker processes.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Process only the first 10 documents.",
    )
    parser.add_argument(
        "--local",
        action="store_true",
        help="Read from ./local_output/pdfs/, write to ./local_output/parsed/.",
    )
    parser.add_argument(
        "--prefix",
        default=None,
        help="Only process S3 keys (or local paths) containing this substring.",
    )
    parser.add_argument(
        "--benchmark",
        action="store_true",
        help="Run one doc through fast and hi_res, print timing comparison, then exit.",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip documents that already have a parsed JSON in the output prefix.",
    )
    return parser.parse_args()


def _get_existing_stems(args: argparse.Namespace) -> set[str]:
    """Return the set of already-parsed document stems."""
    existing: set[str] = set()
    if not args.skip_existing:
        return existing

    if args.local:
        out_dir = Path("./local_output/parsed")
        if out_dir.exists():
            for p in out_dir.glob("*.json"):
                existing.add(p.stem)
    else:
        from utils.s3_client import list_json_keys

        keys = list_json_keys(args.bucket, args.output_prefix)
        for k in keys:
            existing.add(Path(k).stem)

    logger.info("Skip-existing: found %d already-parsed documents.", len(existing))
    return existing


def main() -> None:
    args = parse_args()
    start_time = datetime.datetime.utcnow()

    if args.benchmark:
        benchmark_mode(args)
        return

    # ----------------------------------------------------------------
    # Collect PDFs
    # ----------------------------------------------------------------
    if args.local:
        local_pdf_dir = Path("./local_output/pdfs")
        local_pdf_dir.mkdir(parents=True, exist_ok=True)
        pdf_paths = [str(p) for p in local_pdf_dir.glob("*.pdf")]
        logger.info("Local mode: found %d PDFs in %s", len(pdf_paths), local_pdf_dir)
        source_items = pdf_paths
    else:
        from utils.s3_client import list_pdf_keys

        source_items = list_pdf_keys(args.bucket, args.input_prefix)

    # Apply --prefix filter
    if args.prefix:
        before = len(source_items)
        source_items = [s for s in source_items if args.prefix in s]
        logger.info(
            "--prefix '%s' filtered %d -> %d items",
            args.prefix,
            before,
            len(source_items),
        )

    # Skip existing
    existing_stems = _get_existing_stems(args)
    if existing_stems:
        before = len(source_items)
        source_items = [
            s for s in source_items if Path(os.path.basename(s)).stem not in existing_stems
        ]
        logger.info("Skipped %d already-parsed documents.", before - len(source_items))

    # Apply --dry-run limit
    if args.dry_run:
        source_items = source_items[:10]
        logger.info("--dry-run: limiting to %d documents.", len(source_items))

    logger.info("Found %d documents to process", len(source_items))

    if not source_items:
        logger.info("Nothing to process. Exiting.")
        return

    # ----------------------------------------------------------------
    # Build args dict for worker (must be picklable)
    # ----------------------------------------------------------------
    args_dict = {
        "bucket": args.bucket,
        "input_prefix": args.input_prefix,
        "output_prefix": args.output_prefix,
        "strategy": args.strategy,
        "local": args.local,
    }

    # ----------------------------------------------------------------
    # Parallel processing
    # ----------------------------------------------------------------
    all_results: list[dict] = []
    completed_count = 0

    with ProcessPoolExecutor(max_workers=args.workers) as executor:
        future_to_item = {
            executor.submit(process_document, item, args_dict): item
            for item in source_items
        }
        for future in as_completed(future_to_item):
            item = future_to_item[future]
            try:
                result = future.result()
            except Exception as exc:
                logger.error("Unhandled exception for %s: %s", item, exc)
                result = {
                    "key": item,
                    "status": "failed",
                    "flags": [],
                    "error": str(exc),
                    "product_name": "",
                    "manufacturer": "",
                    "category": "",
                    "doc_type": "",
                }
            all_results.append(result)
            completed_count += 1
            if completed_count % 50 == 0:
                logger.info(
                    "Progress: %d / %d documents completed.",
                    completed_count,
                    len(source_items),
                )

    logger.info(
        "Processing complete. ok=%d fallback=%d failed=%d",
        sum(1 for r in all_results if r["status"] in ("ok", "fallback_used")),
        sum(1 for r in all_results if r["status"] == "fallback_used"),
        sum(1 for r in all_results if r["status"] == "failed"),
    )

    # ----------------------------------------------------------------
    # Save parsing report
    # ----------------------------------------------------------------
    report = generate_report(all_results, args, start_time)
    report_key = "parsing_report.json"

    if args.local:
        out_dir = Path("./local_output/parsed")
        out_dir.mkdir(parents=True, exist_ok=True)
        report_path = out_dir / report_key
        with open(report_path, "w", encoding="utf-8") as fh:
            json.dump(report, fh, indent=2, ensure_ascii=False)
        logger.info("Saved parsing report -> %s", report_path)
    else:
        from utils.s3_client import upload_json

        s3_report_key = args.output_prefix.rstrip("/") + "/" + report_key
        upload_json(args.bucket, s3_report_key, report)
        logger.info(
            "Uploaded parsing report -> s3://%s/%s", args.bucket, s3_report_key
        )


if __name__ == "__main__":
    main()
