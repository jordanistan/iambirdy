# Birdy photo deck — 2026-10-04

The site now has a real-photo hero, warmer journal copy, and an accessible scroll-snap media deck. Source list: `birdy-gallery.json`; regenerate the deck with `python3 scripts/build_gallery.py`. Public photo/video derivatives live together in `site-assets/gallery/`. Each entry has `type`, `src`, `alt`, and `caption`; `src` must be a safe checked-in image or video filename, not an expiring Google Photos media URL.

Current review set: 314 photos and 29 videos. This includes a metadata-free derivative of the original hero plus web derivatives of all 342 supported files in the owner-supplied local `Birdy/` folder (301 standard images, 12 raw photos, and 29 videos). Full-resolution masters and the archive are ignored and are not staged. Public filenames are opaque; original filenames, capture dates, GPS EXIF, camera fields, XMP, IPTC, and color-profile metadata are not published. `scripts/import_gallery_media.py` rebuilds the derivatives with ImageMagick and ffmpeg.

After adding media, check phone swiping/manual scrolling, arrows, keyboard Left/Right/Home/End, the counter, resizing, reduced motion, no-JS scrolling, image links, and native video controls. For each place, get Jordan's notes before writing a location, visit date, or anecdote. Most imported entries intentionally use generic accessible labels pending visual/editorial review; replace those with accurate descriptions without inferring private location details. No invented trips.

Canonical production generator and photo-story intake: `jordanistan/illnetwork/portfolio` and `.github/portfolio/birdy/PHOTO_STORY_INTAKE.md`. Keep the source/native manifests, gallery renderer and shared CSS/JS aligned when porting.

Fundraising: Jordan selected personal routine care and adventures. Draft and budget worksheet are in `jordanistan/illnetwork/.github/portfolio/birdy/GOFUNDME_DRAFT.md`; issue #48. No GoFundMe was created; add a donation link only after the owner supplies a reviewed, verified published URL. No fake amounts, emergencies, donation counts, payment widgets or promises.

Local validation for this import: native JS/Python syntax; 343-entry manifest/source existence; image/video rendering and traversal/remote-path rejection; fresh 2-page staged review with 0 errors; all 314 public WebP files inspected with no EXIF, GPS, XMP, IPTC, or ICC fields. Chromium loaded 343 items/29 videos at desktop size; at 390×844 it had no horizontal overflow, showed controls, advanced with Next, reached item 343 with End, and retained track focus. Remote CI/deployment evidence remains pending and belongs in central issue #47 after observation.

Live deployment follow-up: old CSS/JS were still observed in the cloud browser after the new HTML deployed. Birdy builds now use content-hashed CSS/JS filenames, so changes select a fresh asset URL. Native staging regenerates the deck and versioned assets before copying the public artifact. Actual deployed controls will be rechecked after this fix.


## Curated collections update — 2026-11-04

- The full manifest remains at 589 files (478 still photos and 111 videos). Source-backed collection labels separate the original 343-item Birdy album and the 246-item Instagram import. No images/videos were removed, renamed, or re-encoded.
- The photo wall now opens on Birdy's album and offers independent All/Photos/Videos type filters and Birdy's album / Highlights / Instagram archive / Everything collection filters. Existing lightbox, arrows, keyboard/swipe gestures, batches and no-JavaScript links remain intact.
- Nineteen selected photographs are highlighted. The existing real-photo introduction plus 24 additional pictures now have accurate descriptions and personable captions based on individually viewed thumbnails. Captions do not claim dates, addresses, specific named venues, events, or private location details.
- Remaining imported photos/videos retain deliberately generic text; do not invent place names or story details without photo review or owner notes. The Instagram archive has known unrelated content; it stays available for curation rather than deleting unverified originals.
- New regression test `scripts/test_gallery_curation.py` checks exact counts, collection metadata, safe markup, and caption escaping. CI executes it before staging and artifact checking.
- Review/deployment evidence: pending at commit time; check the PR workflow, merge to main, then confirm the Pages run and live gallery. This source is native iambirdy only; central illnetwork/portfolio generator remains out of sync. Preserve the existing live design. No new fundraising/commerce links.
