#!/usr/bin/env python3
"""Regression checks for Birdy's curated gallery and its privacy-safe markup."""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from birdy_gallery import render_gallery

items = json.loads((ROOT / "birdy-gallery.json").read_text())
assert len(items) == 589, "Unexpected gallery size; inspect the import before changing totals"
assert sum(item["collection"] == "birdy" for item in items) == 343
assert sum(item["collection"] == "instagram" for item in items) == 246
assert sum(item.get("featured") is True for item in items) == 19
assert sum(item.get("curated") is True for item in items) == 59
assert all(item.get("alt", "").strip() and item.get("caption", "").strip() for item in items)

html = render_gallery(items)
assert html.count('class="grid-item"') == len(items)
assert html.count('data-featured="true"') == 19
assert html.count('class="grid-caption"') == 59
assert "Public copies are optimized for the web" not in html
assert "Bluebonnets, boat rides, blanket forts" in html
assert html.count('data-collection="birdy"') == 343
assert html.count('data-collection="instagram"') == 246
assert 'data-gallery-collection="featured"' in html
assert 'data-gallery-collection="instagram"' in html
assert 'data-gallery-collection="all"' in html
assert 'aria-label="Collection"' in html
assert 'data-gallery-filter="video"' in html

for key, val in (
    ("collection", "unknown"),
    ("featured", "yes"),
    ("curated", "yes"),
):
    altered = [dict(items[0], **{key: val})]
    try:
        render_gallery(altered)
    except ValueError:
        pass
    else:
        raise AssertionError(f"Unsafe {key} accepted")

escaped = render_gallery([dict(items[0], caption='<script>danger</script>')])
assert '&lt;script&gt;' in escaped and '<script>danger</script>' not in escaped
page = (ROOT / "index.html").read_text()
for text in ("Big ears.<br>Bigger personality.", "Eight years. One slice of pizza.", "Tent up. Birdy down.", "What does Birdy get excited about?"):
    assert text in page, f"Missing Birdy-specific page copy: {text}"
assert "A pink collar.<br>A world to explore." not in page
assert "A name, a setting, and the details" not in page
assert "Public copies are optimized for the web" not in page
assert page.count('class="grid-caption"') == 59
print("Birdy editorial checks: 589 items, 59 visible reviewed captions, truthful story sections verified")
