# Birdy photo deck — 2026-10-04

The site now has a real-photo hero, warmer journal copy, and an accessible scroll-snap deck. Source list: `birdy-gallery.json`; regenerate the deck with `python3 scripts/build_gallery.py`. Add reviewed photos in `site-assets/gallery/`, then add `src`, `alt`, and `caption` entries to the list. `src` must be a safe checked-in image filename, not an expiring Google Photos media URL.

Current published set: one actual photo, `iambirdy.jpg`. The buttons are disabled with one photo; no duplicate or fabricated slides are used. Google Photos album access was denied in the cloud browser. Do not attempt a workaround. The album remains an outbound link; there is no automatic synchronization.

After adding photos, check phone swiping/manual scrolling, arrows, keyboard Left/Right/Home/End, the counter, resizing, reduced motion, no-JS scrolling, and full-size links. For each place, get Jordan's notes before writing a location, visit date, or anecdote. Describe visible content in alt text. No invented trips.

Canonical production generator and photo-story intake: `jordanistan/illnetwork/portfolio` and `.github/portfolio/birdy/PHOTO_STORY_INTAKE.md`. Keep the source/native manifests, gallery renderer and shared CSS/JS aligned when porting.

Fundraising: Jordan selected personal routine care and adventures. Draft and budget worksheet are in `jordanistan/illnetwork/.github/portfolio/birdy/GOFUNDME_DRAFT.md`; issue #48. No GoFundMe was created; add a donation link only after the owner supplies a reviewed, verified published URL. No fake amounts, emergencies, donation counts, payment widgets or promises.

Local validation: shared/native JS syntax; existing 5 release tests; 37-page source preview artifact; 2-page Birdy production and native review artifacts; escaped gallery text and traversal/remote-image-path rejection. Remote workflow/deployment evidence belongs in central issue #47 after it is observed.
