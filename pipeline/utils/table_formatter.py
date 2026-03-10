"""Convert Unstructured Table elements to markdown and dict formats."""

import logging

logger = logging.getLogger(__name__)

try:
    from bs4 import BeautifulSoup

    _BS4_AVAILABLE = True
except ImportError:
    _BS4_AVAILABLE = False
    logger.warning(
        "bs4 (beautifulsoup4) not installed. Table HTML parsing will fall back to "
        "plain text. Install with: pip install beautifulsoup4"
    )

MAX_COLUMNS = 20


def _get_html(table_element) -> str | None:
    """Safely retrieve text_as_html from a Table element's metadata."""
    try:
        html = table_element.metadata.text_as_html
        return html if html else None
    except AttributeError:
        return None


def _expand_cells(row_tag, tag_name: str) -> list[str]:
    """Extract cell texts from a <tr>, expanding colspan repetitions.

    Handles basic colspan by repeating the cell text. Rowspan is not
    tracked across rows — cells are included in the row they appear in.
    """
    cells: list[str] = []
    for cell in row_tag.find_all(tag_name):
        text = cell.get_text(separator=" ", strip=True)
        try:
            span = int(cell.get("colspan", 1))
        except (ValueError, TypeError):
            span = 1
        span = min(span, MAX_COLUMNS)
        cells.extend([text] * span)
        if len(cells) >= MAX_COLUMNS:
            cells = cells[:MAX_COLUMNS]
            break
    return cells


def _parse_rows(soup) -> tuple[list[str], list[list[str]]]:
    """Parse a BeautifulSoup table into headers and data rows.

    Returns:
        Tuple of (headers, data_rows) where headers is a list of strings
        and data_rows is a list of row-lists.
    """
    table_tag = soup.find("table")
    if not table_tag:
        return [], []

    all_rows = table_tag.find_all("tr")
    if not all_rows:
        return [], []

    first_row = all_rows[0]
    th_cells = first_row.find_all("th")

    if th_cells:
        headers = [th.get_text(separator=" ", strip=True) for th in th_cells]
        data_rows_raw = all_rows[1:]
    else:
        # Treat first row as data; generate generic column headers later
        headers = []
        data_rows_raw = all_rows

    data_rows: list[list[str]] = []
    for row in data_rows_raw:
        cells = _expand_cells(row, "td") or _expand_cells(row, "th")
        if cells:
            data_rows.append(cells)

    # If no th headers, derive column count from first data row
    if not headers and data_rows:
        col_count = min(len(data_rows[0]), MAX_COLUMNS)
        headers = [f"col_{i + 1}" for i in range(col_count)]

    return headers, data_rows


def table_to_markdown(table_element) -> str:
    """Convert a Table element to a GitHub-flavored markdown table.

    Uses text_as_html from the element's metadata when available. Falls
    back to the element's plain text if HTML is absent or bs4 is missing.

    Args:
        table_element: An Unstructured Table element.

    Returns:
        Markdown string representing the table.
    """
    html = _get_html(table_element)
    if not html or not _BS4_AVAILABLE:
        return str(table_element.text).strip()

    try:
        soup = BeautifulSoup(html, "html.parser")
        headers, data_rows = _parse_rows(soup)

        if not headers:
            return str(table_element.text).strip()

        col_count = len(headers)

        def pad_row(cells: list[str]) -> list[str]:
            padded = cells[:col_count]
            while len(padded) < col_count:
                padded.append("")
            return padded

        header_line = "| " + " | ".join(headers) + " |"
        separator_line = "| " + " | ".join(["---"] * col_count) + " |"
        row_lines = [
            "| " + " | ".join(pad_row(row)) + " |"
            for row in data_rows
        ]

        return "\n".join([header_line, separator_line] + row_lines)

    except Exception:
        logger.debug("table_to_markdown fallback to plain text", exc_info=True)
        return str(table_element.text).strip()


def table_to_dict(table_element) -> list[dict]:
    """Convert a Table element to a list of row dictionaries.

    The first row is used as column headers. If it contains no <th> tags,
    generic column names (col_1, col_2, …) are generated.

    Args:
        table_element: An Unstructured Table element.

    Returns:
        List of dicts mapping column header -> cell value. Returns an
        empty list if parsing fails or bs4 is unavailable.
    """
    if not _BS4_AVAILABLE:
        return []

    html = _get_html(table_element)
    if not html:
        return []

    try:
        soup = BeautifulSoup(html, "html.parser")
        headers, data_rows = _parse_rows(soup)

        if not headers:
            return []

        col_count = len(headers)
        result: list[dict] = []
        for row in data_rows:
            cells = row[:col_count]
            while len(cells) < col_count:
                cells.append("")
            result.append(dict(zip(headers, cells)))

        return result

    except Exception:
        logger.debug("table_to_dict failed", exc_info=True)
        return []


def format_table(table_element) -> dict:
    """Format a Table element into both markdown and dict representations.

    Args:
        table_element: An Unstructured Table element.

    Returns:
        Dict with keys "markdown" (str) and "data" (list[dict]).
        Falls back to plain text markdown and empty data list on any error.
    """
    try:
        markdown = table_to_markdown(table_element)
        data = table_to_dict(table_element)
        return {"markdown": markdown, "data": data}
    except Exception:
        logger.warning("format_table encountered an error", exc_info=True)
        try:
            plain = str(table_element.text).strip()
        except Exception:
            plain = ""
        return {"markdown": plain, "data": []}
