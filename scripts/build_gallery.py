#!/usr/bin/env python3
"""Rebuild only Birdy's gallery section from the checked-in photo list."""
from pathlib import Path
import json, re
from birdy_gallery import render_gallery
root = Path(__file__).resolve().parents[1]
page = root / 'index.html'
html = page.read_text()
gallery = render_gallery(json.loads((root / 'birdy-gallery.json').read_text()))
updated, count = re.subn(r'<section class="section" id="photos"[^>]*>.*?</section>', lambda _: gallery, html, count=1, flags=re.S)
if count != 1:
    raise SystemExit('Expected the existing photo section; refusing to rewrite the page')
page.write_text(updated)
print('Birdy photo deck rebuilt')
