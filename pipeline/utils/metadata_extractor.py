"""Extract product metadata from Unstructured elements."""

import logging
import os
import re

logger = logging.getLogger(__name__)

KNOWN_MANUFACTURERS: list[str] = [
    "Carlisle",
    "Firestone",
    "GAF",
    "Johns Manville",
    "Soprema",
    "Sika",
    "Versico",
    "Mule-Hide",
    "GenFlex",
    "IB Roof",
    "Elevate",
    "Polyglass",
    "Henry",
    "Tremco",
    "Hunter Panels",
    "Atlas Roofing",
    "Owens Corning",
    "GreenGuard",
    "Garland",
    "Seaman",
    "Duro-Last",
    "Godfrey Roofing",
    "OMG Roofing",
    "SFS",
    "SFS Group",
    "Beacon Roofing",
    "ABC Supply",
    "CETCO",
    "Insulfoam",
    "Rmax",
    "DuPont",
    "DOW",
]

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "membrane": [
        "membrane",
        "TPO",
        "EPDM",
        "PVC",
        "thermoplastic",
        "elastomeric",
        "roofing sheet",
    ],
    "insulation": [
        "insulation",
        "polyiso",
        "polyisocyanurate",
        "XPS",
        "EPS",
        "rigid board",
        "R-value",
        "thermal",
    ],
    "adhesive": [
        "adhesive",
        "bonding adhesive",
        "splice cement",
        "contact cement",
        "glue",
        "CAV-GRIP",
        "bonding",
    ],
    "coating": [
        "coating",
        "roof coating",
        "elastomeric coating",
        "acrylic",
        "silicone coating",
    ],
    "flashing": [
        "flashing",
        "drip edge",
        "termination bar",
        "edge metal",
        "coping",
    ],
    "sealant": [
        "sealant",
        "caulk",
        "lap sealant",
        "pourable sealer",
        "one-part",
        "two-part",
    ],
    "fastener": [
        "fastener",
        "screw",
        "plate",
        "anchor",
        "insulation fastener",
        "AccuTrac",
        "Accuseam",
    ],
    "cover_board": [
        "cover board",
        "coverboard",
        "DensDeck",
        "SecurShield",
        "gypsum",
    ],
    "vapor_barrier": [
        "vapor barrier",
        "vapor retarder",
        "air barrier",
        "VaporShield",
    ],
    "accessory": [
        "tape",
        "walkpad",
        "seam tape",
        "pressure-sensitive",
        "pipe seal",
        "pitch pocket",
        "protection fabric",
    ],
    "other": [],
}

DOCTYPE_KEYWORDS: dict[str, list[str]] = {
    "product data sheet": ["product data sheet", "PDS", "data sheet"],
    "technical data bulletin": ["technical data bulletin", "TDB", "technical bulletin"],
    "safety data sheet": ["safety data sheet", "SDS", "MSDS", "GHS"],
    "installation guide": [
        "installation guide",
        "installation instructions",
        "application guide",
    ],
    "warranty": ["warranty", "limited warranty"],
    "detail drawing": ["detail drawing", "detail", "CAD drawing"],
    "other": [],
}


def _element_text(element) -> str:
    """Safely extract text from an Unstructured element."""
    try:
        return str(element.text) if element.text else ""
    except Exception:
        return ""


def _element_page(element) -> int:
    """Safely extract page number from an Unstructured element, defaulting to 1."""
    try:
        page = element.metadata.page_number
        return int(page) if page is not None else 1
    except Exception:
        return 1


def _element_type_name(element) -> str:
    """Return the class name of an Unstructured element."""
    return type(element).__name__


_DOC_TYPE_HEADER_RE = re.compile(
    r"^\s*(product\s+data\s+sheet|technical\s+data\s+bulletin|safety\s+data\s+sheet"
    r"|installation\s+guide|warranty|detail\s+drawing|SDS|MSDS|TDB|PDS)\s*$",
    re.IGNORECASE,
)
_FRAGMENTED_RE = re.compile(r"^(?:[A-Z]\s){3,}")  # "T E C H N I C A L ..."


def _is_usable_title(text: str) -> bool:
    """Return True if text looks like a real product name, not a doc-type header."""
    if len(text) < 8:
        return False
    if _FRAGMENTED_RE.match(text):
        return False
    if _DOC_TYPE_HEADER_RE.match(text):
        return False
    return True


def extract_product_name(elements: list, filename: str) -> tuple[str, bool]:
    """Extract product name from Unstructured elements or fall back to filename.

    Args:
        elements: List of Unstructured document elements.
        filename: Original filename (used as fallback).

    Returns:
        Tuple of (product_name, needs_review). needs_review is True when
        the name was derived from the filename rather than document content.
    """
    # 1. First clean Title element (skip fragmented/doc-type headers)
    for el in elements:
        if _element_type_name(el) == "Title":
            text = _element_text(el).strip()
            if _is_usable_title(text):
                return text, False

    # 2. First Header element
    for el in elements:
        if _element_type_name(el) == "Header":
            text = _element_text(el).strip()
            if _is_usable_title(text):
                return text, False

    # 3. First NarrativeText if short and on page 1
    for el in elements:
        if _element_type_name(el) == "NarrativeText":
            text = _element_text(el).strip()
            if 10 <= len(text) < 100 and _element_page(el) == 1:
                return text, False

    # 4. Derive from filename stem
    stem = os.path.splitext(os.path.basename(filename))[0]
    # Replace underscores/dashes with spaces
    name = re.sub(r"[_\-]+", " ", stem).strip()
    # Strip known manufacturer names (case-insensitive) from start/end
    for mfr in sorted(KNOWN_MANUFACTURERS, key=len, reverse=True):
        pattern = r"(?i)(^" + re.escape(mfr) + r"\s*|\s*" + re.escape(mfr) + r"$)"
        name = re.sub(pattern, "", name).strip()
    name = name.strip() or stem
    return name, True


def extract_manufacturer(elements: list, filename: str) -> tuple[str, bool]:
    """Extract the manufacturer name from document elements or filename.

    Args:
        elements: List of Unstructured document elements.
        filename: Original filename used as a fallback search target.

    Returns:
        Tuple of (manufacturer, needs_review). needs_review is True when
        no manufacturer was found and "Unknown" is returned.
    """
    all_texts = [_element_text(el) for el in elements]
    combined = " ".join(all_texts)

    # Search element texts (case-insensitive), prefer longer matches
    for mfr in sorted(KNOWN_MANUFACTURERS, key=len, reverse=True):
        if re.search(re.escape(mfr), combined, re.IGNORECASE):
            return mfr, False

    # Check filename
    name_to_check = os.path.basename(filename)
    for mfr in sorted(KNOWN_MANUFACTURERS, key=len, reverse=True):
        if re.search(re.escape(mfr), name_to_check, re.IGNORECASE):
            return mfr, False

    return "Unknown", True


def classify_product_category(elements: list) -> tuple[str, bool]:
    """Classify the product category by scoring keyword hits against element text.

    Args:
        elements: List of Unstructured document elements.

    Returns:
        Tuple of (category, needs_review). needs_review is True when the
        best score is zero or when the top two categories are within 2 hits.
    """
    combined = " ".join(_element_text(el) for el in elements)

    scores: dict[str, int] = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        if not keywords:
            scores[category] = 0
            continue
        count = 0
        for kw in keywords:
            count += len(re.findall(re.escape(kw), combined, re.IGNORECASE))
        scores[category] = count

    # Exclude "other" from ranking
    ranked = sorted(
        [(cat, sc) for cat, sc in scores.items() if cat != "other"],
        key=lambda x: x[1],
        reverse=True,
    )

    if not ranked or ranked[0][1] == 0:
        return "other", True

    best_cat, best_score = ranked[0]
    needs_review = False

    if len(ranked) > 1:
        second_score = ranked[1][1]
        if best_score - second_score <= 2:
            needs_review = True

    return best_cat, needs_review


def classify_document_type(elements: list, filename: str) -> tuple[str, bool]:
    """Classify the document type by checking filename then leading element text.

    Args:
        elements: List of Unstructured document elements.
        filename: Original filename to check first.

    Returns:
        Tuple of (doc_type, needs_review). needs_review is True when no
        known doc type is matched and "other" is returned.
    """
    filename_lower = os.path.basename(filename).lower()

    for doc_type, keywords in DOCTYPE_KEYWORDS.items():
        if doc_type == "other":
            continue
        for kw in keywords:
            if kw.lower() in filename_lower:
                return doc_type, False

    # Check first 3 elements
    first_three_text = " ".join(
        _element_text(el) for el in elements[:3]
    ).lower()

    for doc_type, keywords in DOCTYPE_KEYWORDS.items():
        if doc_type == "other":
            continue
        for kw in keywords:
            if kw.lower() in first_three_text:
                return doc_type, False

    return "other", True
