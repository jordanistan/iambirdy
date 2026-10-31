# iambirdy.com checkpoint — 2026-10-04

- New responsive static review built, with original source/history preserved.
- Native Pages review uses a publish allowlist; no private docs or old application source are staged.
- Preview has no live lead capture. Production generator and launch guide: `jordanistan/illnetwork/portfolio` and `.github/portfolio/LAUNCH.md`.
- Added pinned build, Gitleaks, CodeQL Actions. Successful scans/deployment still need observed workflow evidence; native security settings are not verified.
- Browser QA is pending (no supported browser-control skill in this build session).
- Next task: inspect actual CI, then perform desktop/mobile/keyboard review; consult the central task board before writing.

## Birdy journal and gallery update — 2026-10-04

- Rewrote Birdy as a photo/travel journal, replaced the hero mascot with her actual portrait, and built a horizontal deck with native swipe/scroll, keyboard controls, previous/next, a counter, and reduced-motion/no-JS behavior.
- Exactly one real photo is available. Album access was denied; do not bypass the denial. Multiple-photo stories await selected files and Jordan's place/moment notes.
- Build-time manifest and renderer: `birdy-gallery.json`, `scripts/build_gallery.py`, `scripts/birdy_gallery.py`. These operational files are outside the explicit Pages publish allowlist. No new permissions, trackers or payment scripts.
- Central P009 issue #47 holds the branch, scope, test and actual CI/deployment checkpoint. GoFundMe care/adventures draft and owner budget task: central issue #48. There is no live fundraiser or donation URL yet.
- Local checks passed: JS syntax, native 2-page artifact check, central 5 release tests, 37-page preview, Birdy 2-page production artifact, gallery escaping/image-path boundaries. Remote gallery CI/deploy still need observation; earlier pending evidence above describes the initial build.

## Full local media import — 2026-10-04

- Imported all 342 supported files from the owner-supplied local `Birdy/` folder: 301 standard images, 12 raw photos, and 29 videos. Added the existing hero as a stripped derivative, for 343 gallery entries total (314 images and 29 videos).
- Full-resolution masters and `Birdy-1-001.zip` remain local and ignored. The staged review contains only 186 MB of web derivatives in `site-assets/gallery/`; the largest file is 15,378,502 bytes.
- Public filenames are opaque. Image derivatives are resized WebP files generated with metadata stripping. Artifact validation rejects EXIF/XMP/GPS-style markers and WebP EXIF/XMP/ICC chunks. ExifTool found no EXIF, GPS, XMP, IPTC, or ICC fields across all 314 published WebP files.
- The deck now renders both images and native playable videos, preserves scroll/keyboard controls, uses `preload="none"` for video, and includes a self-only `media-src` CSP. Generic captions avoid inventing places, dates, or stories pending owner notes and visual/editorial review.
- Local checks passed: JS and Python syntax, fresh 2-page staged artifact check with 0 errors, 343 unique manifest sources, 314 rendered gallery images, 29 rendered videos, opaque-path check, source-name absence, and metadata scan. Chromium loaded all 343 items/29 videos at desktop size; at 390×844 the page had no horizontal overflow, controls were visible, Next advanced to item 2, End reached item 343, and focus stayed on the track. Central source is synchronized and its release checks pass. Remote CI, deployment, and live verification remain pending.

## Instagram link and banner removal — 2026-10-31

- Branch `claude/birdy-instagram-20261031` (from `main` f3f8f56). Removed the "DESIGN REVIEW" banner from both pages; header, contact panel, and footer now link to `https://www.instagram.com/nerdy.dirty.birdy/`. The contact panel no longer says "Design review only". No embeds were added and the self-only CSP is unchanged.
- `check_review.py` now rejects `mailto:` links on every page, so the no-email guard still works without the banner text.
- Instagram media: the owner exported @nerdy.dirty.birdy via "Download your information" (kept local in gitignored `instagram/`). The importer reads only media listed in `posts.json`, `posts_1.json` and `reels.json`, minus `recently_deleted_content.json`. Stories, profile photos and "other content" items stay out. 282 listed files gave 246 unique items (164 photos, 82 videos), shown newest first after the existing 343 and labeled as from Instagram. Duplicates are skipped by content hash. This is a one-time import; automatic sync would need a professional account and a Graph API token stored as an Actions secret.
- Local checks passed: `node --check`, fresh stage with 2 pages and 0 errors, fresh stage with 589 slides and 111 videos, 2 pages, 0 errors (321 MB). ExifTool found no EXIF, GPS, XMP, IPTC or ICC fields in the 164 new WebP files, and ffprobe showed no location or creation tags on the new MP4s. Remote CI and deploy have not been observed, Central `illnetwork/portfolio` source has not been synced with this change.
