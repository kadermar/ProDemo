"""Text cleaning utilities for PDF-extracted content."""

import logging
import re

logger = logging.getLogger(__name__)


def normalize_whitespace(text: str) -> str:
    """Normalize whitespace in extracted text.

    Steps applied:
    - Normalize line endings to \\n.
    - Collapse 3+ consecutive blank lines to 2.
    - Collapse multiple spaces/tabs on a single line to one space.
    - Strip leading/trailing whitespace from each line.
    - Strip leading/trailing whitespace from the whole text.

    Args:
        text: Raw text to normalize.

    Returns:
        Whitespace-normalized text.
    """
    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Strip each line and collapse intra-line whitespace
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]
    text = "\n".join(lines)

    # Collapse 3+ consecutive newlines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def fix_ocr_artifacts(text: str) -> str:
    """Fix common OCR and PDF extraction artifacts.

    Fixes applied:
    - Remove form feed characters.
    - Fix common Unicode typography replacements (smart quotes, etc.).
    - Fix "fi" and "fl" ligatures.
    - Rejoin words broken by soft hyphens at line boundaries.

    Args:
        text: Text possibly containing OCR or encoding artifacts.

    Returns:
        Cleaned text with artifacts corrected.
    """
    # Remove form feed characters
    text = text.replace("\x0c", "")

    # Fix common Unicode encoding issues (smart quotes, apostrophes)
    text = text.replace("\u2019", "'")
    text = text.replace("\u2018", "'")
    text = text.replace("\u201c", '"')
    text = text.replace("\u201d", '"')

    # Fix fi and fl ligatures (common PDF glyph substitution artifacts)
    text = text.replace("\ufb01", "fi")
    text = text.replace("\ufb02", "fl")

    # Fix broken hyphenation at line endings:
    # "appli-\ncation" -> "application"
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)

    return text


def clean_text(text: str) -> str:
    """Apply all text cleaning steps in order.

    Runs fix_ocr_artifacts followed by normalize_whitespace.

    Args:
        text: Raw text from PDF extraction.

    Returns:
        Fully cleaned text.
    """
    text = fix_ocr_artifacts(text)
    text = normalize_whitespace(text)
    return text
