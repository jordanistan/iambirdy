#!/usr/bin/env python3
"""Rebuild only Birdy's gallery section from the checked-in photo list."""
from pathlib import Path
import hashlib, json, re
from birdy_gallery import render_gallery
root = Path(__file__).resolve().parents[1]
page = root / 'index.html'
html = page.read_text()
gallery = render_gallery(json.loads((root / 'birdy-gallery.json').read_text()))
updated, count = re.subn(r'<section class="section" id="photos"[^>]*>.*?</section>', lambda _: gallery, html, count=1, flags=re.S)
if count != 1:
    raise SystemExit('Expected the existing photo section; refusing to rewrite the page')
for extension in ('css', 'js'):
    original = root / 'site-assets' / ('site.' + extension)
    data = original.read_bytes()
    filename = 'site-' + hashlib.sha256(data).hexdigest()[:12] + '.' + extension
    (root / 'site-assets' / filename).write_bytes(data)
    pattern = r'site-assets/site(?:-[a-f0-9]{12})?\.' + extension + r'(?:\?[^"\s]*)?'
    updated = re.sub(pattern, 'site-assets/' + filename, updated)
page.write_text(updated)
print('Birdy photo deck rebuilt')
