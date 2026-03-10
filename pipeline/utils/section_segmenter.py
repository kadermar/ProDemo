"""Segment Unstructured elements into logical sections based on heading boundaries."""

import logging

logger = logging.getLogger(__name__)

try:
    from unstructured.documents.elements import (
        Header,
        ListItem,
        NarrativeText,
        Table,
        Text,
        Title,
    )

    _HEADING_TYPES = (Title, Header)
    _CONTENT_TYPES = (NarrativeText, ListItem, Text)
    _TABLE_TYPE = Table
    _UNSTRUCTURED_AVAILABLE = True
except ImportError:
    _HEADING_TYPES = ()
    _CONTENT_TYPES = ()
    _TABLE_TYPE = None
    _UNSTRUCTURED_AVAILABLE = False
    logger.warning(
        "unstructured package not installed. Section segmentation will produce "
        "empty results. Install with: pip install 'unstructured[pdf]'"
    )

SECTION_TYPE_MAP: dict[str, str] = {
    "product description": "Product Description",
    "description": "Product Description",
    "overview": "Product Description",
    "physical properties": "Physical Properties",
    "physical data": "Physical Properties",
    "properties": "Physical Properties",
    "technical data": "Technical Data",
    "technical specifications": "Technical Data",
    "performance": "Technical Data",
    "test data": "Technical Data",
    "installation": "Installation",
    "application": "Installation",
    "how to apply": "Installation",
    "storage": "Storage and Handling",
    "handling": "Storage and Handling",
    "shelf life": "Storage and Handling",
    "warranty": "Warranty",
    "guarantee": "Warranty",
    "compliance": "Compliance",
    "listing": "Compliance",
    "approval": "Compliance",
    "certification": "Compliance",
    "limitation": "Limitations",
    "caution": "Limitations",
    "warning": "Limitations",
    "safety": "Safety",
    "hazard": "Safety",
    "contact": "Contact Information",
    "ordering": "Contact Information",
    "technical service": "Contact Information",
}


def infer_section_type(heading_text: str) -> str:
    """Infer a canonical section type from heading text.

    Performs a case-insensitive substring search through SECTION_TYPE_MAP
    keys in definition order, returning the first match.

    Args:
        heading_text: The heading string to classify.

    Returns:
        Canonical section type string, or "Other" if no keyword matches.
    """
    lower = heading_text.lower()
    for keyword, section_type in SECTION_TYPE_MAP.items():
        if keyword in lower:
            return section_type
    return "Other"


def _element_text(element) -> str:
    """Safely extract text from an Unstructured element."""
    try:
        return str(element.text) if element.text else ""
    except Exception:
        return ""


import re as _re

# Spec-reference patterns that look like headings but aren't section headings
_SPEC_REF_RE = _re.compile(
    r"^(ASTM|ANSI|ISO|UL|FM|IBC|ICC|CAN/ULC|ASCE|NFPA|CSA)\s+[\w\-/.]+\s*$",
    _re.IGNORECASE,
)


def _is_real_heading(element) -> bool:
    """Return True only for headings that look like genuine section headings.

    Filters out:
    - Very short headings (<8 chars)
    - Standard/spec references (ASTM C518, CAN/ULC S770-03, etc.)
    - Single words that are likely spec values, not section names
    """
    text = _element_text(element).strip()
    if len(text) < 8:
        return False
    if _SPEC_REF_RE.match(text):
        return False
    return True


def _is_heading(element) -> bool:
    """Return True if the element is a meaningful Title or Header."""
    if not _UNSTRUCTURED_AVAILABLE:
        return False
    return isinstance(element, _HEADING_TYPES) and _is_real_heading(element)


def _is_content(element) -> bool:
    """Return True if the element is a text content element."""
    if not _UNSTRUCTURED_AVAILABLE:
        return False
    return isinstance(element, _CONTENT_TYPES)


def _is_table(element) -> bool:
    """Return True if the element is a Table."""
    if not _UNSTRUCTURED_AVAILABLE or _TABLE_TYPE is None:
        return False
    return isinstance(element, _TABLE_TYPE)


def _format_content_element(element) -> str:
    """Format a single content element as a string, prefixing list items."""
    if not _UNSTRUCTURED_AVAILABLE:
        return _element_text(element)
    if isinstance(element, ListItem):
        return "- " + _element_text(element)
    return _element_text(element)


def _build_section(
    heading: str,
    content_elements: list,
    table_elements: list,
) -> dict:
    """Construct a section dict from accumulated elements.

    Args:
        heading: The heading text for this section.
        content_elements: List of NarrativeText/ListItem/Text elements.
        table_elements: List of Table elements in this section.

    Returns:
        Section dict with keys: section_type, heading, content, tables.
    """
    from utils.table_formatter import format_table  # avoid circular import

    section_type = infer_section_type(heading) if heading else "Preamble"
    content_str = "\n\n".join(_format_content_element(el) for el in content_elements)
    tables = [format_table(tbl) for tbl in table_elements]

    return {
        "section_type": section_type,
        "heading": heading,
        "content": content_str,
        "tables": tables,
    }


def segment_into_sections(elements: list) -> list[dict]:
    """Segment a flat list of Unstructured elements into logical sections.

    Algorithm:
    - Walk elements sequentially. New sections begin at Title/Header elements.
    - Content elements (NarrativeText, ListItem, Text) accumulate in the
      current section. Table elements accumulate in the tables list.
    - A "Preamble" section is created for content before the first heading.
    - Consecutive headings with no content between them are merged with " / ".
    - Sections with no content and no tables are dropped (unless the document
      has only one section).
    - If the document has no Title/Header elements at all, a single "Other"
      section is returned containing all text.

    Args:
        elements: Flat list of Unstructured document elements.

    Returns:
        List of section dicts, each with keys: section_type, heading,
        content, tables.
    """
    if not elements:
        return []

    has_headings = any(_is_heading(el) for el in elements)

    # No heading structure at all — return a single aggregated section
    if not has_headings:
        from utils.table_formatter import format_table

        all_content = "\n\n".join(
            _format_content_element(el) for el in elements if _is_content(el)
        )
        all_tables = [format_table(el) for el in elements if _is_table(el)]
        return [
            {
                "section_type": "Other",
                "heading": "",
                "content": all_content,
                "tables": all_tables,
            }
        ]

    # -------------------------------------------------------------------
    # First pass: collect raw sections (heading + content_elements + tables)
    # -------------------------------------------------------------------
    raw_sections: list[dict] = []

    # State for the current in-progress section
    current_heading: str | None = None  # None = preamble
    current_content: list = []
    current_tables: list = []
    # Track consecutive headings (no content yet between them)
    pending_headings: list[str] = []

    def flush_pending(new_heading: str | None = None) -> None:
        """Merge pending consecutive headings into one raw section entry."""
        nonlocal pending_headings, current_heading, current_content, current_tables

        if pending_headings:
            # Merge consecutive headings with " / "
            merged_heading = " / ".join(pending_headings)
            raw_sections.append(
                {
                    "heading": merged_heading,
                    "content_elements": current_content,
                    "table_elements": current_tables,
                }
            )
            current_content = []
            current_tables = []
            pending_headings = []

    for element in elements:
        if _is_heading(element):
            heading_text = _element_text(element).strip()

            if current_heading is None and not pending_headings:
                # We were in preamble — flush it if it has content
                if current_content or current_tables:
                    raw_sections.append(
                        {
                            "heading": "",
                            "content_elements": current_content,
                            "table_elements": current_tables,
                        }
                    )
                    current_content = []
                    current_tables = []
                # Start collecting headings
                pending_headings.append(heading_text)
                current_heading = heading_text
            elif pending_headings and not current_content and not current_tables:
                # Another heading with no content in between — merge
                pending_headings.append(heading_text)
                current_heading = heading_text
            else:
                # There was content — flush the previous pending+content
                flush_pending()
                pending_headings.append(heading_text)
                current_heading = heading_text

        elif _is_content(element):
            if current_heading is None and not pending_headings:
                # Still in preamble
                current_content.append(element)
            else:
                current_content.append(element)

        elif _is_table(element):
            current_tables.append(element)

        # Ignore all other element types silently

    # Flush whatever remains
    if pending_headings or current_content or current_tables:
        if current_heading is None and not pending_headings:
            # Pure preamble with no headings ever encountered (shouldn't
            # happen since we checked has_headings, but guard anyway)
            if current_content or current_tables:
                raw_sections.append(
                    {
                        "heading": "",
                        "content_elements": current_content,
                        "table_elements": current_tables,
                    }
                )
        else:
            flush_pending()
            if current_content or current_tables:
                # The last heading's content
                if raw_sections:
                    last = raw_sections[-1]
                    last["content_elements"] = (
                        last.get("content_elements", []) + current_content
                    )
                    last["table_elements"] = (
                        last.get("table_elements", []) + current_tables
                    )

    # -------------------------------------------------------------------
    # Second pass: build final section dicts, dropping empty sections
    # -------------------------------------------------------------------
    sections: list[dict] = []
    for raw in raw_sections:
        heading = raw["heading"]
        content_elements = raw.get("content_elements", [])
        table_elements = raw.get("table_elements", [])

        # Drop empty sections (no content and no tables)
        if not content_elements and not table_elements and len(raw_sections) > 1:
            continue

        sections.append(_build_section(heading, content_elements, table_elements))

    # Ensure at least one section is returned
    if not sections:
        sections.append(
            {
                "section_type": "Other",
                "heading": "",
                "content": "",
                "tables": [],
            }
        )

    return sections
