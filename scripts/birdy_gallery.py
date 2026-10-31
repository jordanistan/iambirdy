"""Render the media deck at build time; no browser API or album credentials."""
from html import escape
import re

ORIGINAL = 'https://raw.githubusercontent.com/jordanistan/iambirdy/main/iambirdy.jpg'
ALBUM = 'https://photos.app.goo.gl/hmzCdVn8bEniivNn8'

THUMB = r'site-assets/gallery/thumbs/[A-Za-z0-9][A-Za-z0-9._-]*\.webp'
BATCH = 36


def render_gallery(media):
    if not media:
        raise ValueError('The gallery needs at least one real photo or video')
    tiles = []
    for item in media:
        src = item['src']
        kind = item.get('type', 'image')
        if kind not in ('image', 'video'):
            raise ValueError('Gallery type must be image or video')
        extension = r'(?:jpg|jpeg|png|webp)' if kind == 'image' else r'(?:mp4|webm)'
        local = re.fullmatch(rf'(?:assets/birdy|site-assets/gallery)/[A-Za-z0-9][A-Za-z0-9._-]*\.{extension}', src, re.I)
        original_image = kind == 'image' and src in (ORIGINAL, 'iambirdy.jpg')
        if not original_image and not local:
            raise ValueError('Use a checked-in media path, not a temporary album URL')
        if not item.get('alt', '').strip():
            raise ValueError('Every gallery item needs accessible text')
        thumb = item.get('thumb', src if kind == 'image' else '')
        if thumb != src and not re.fullmatch(THUMB, thumb):
            raise ValueError('Gallery thumbnails must be checked-in WebP previews')
        src, thumb, alt, caption = map(escape, (src, thumb, item['alt'], item['caption']))
        badge = '<span class="grid-badge" aria-hidden="true">▶ Video</span>' if kind == 'video' else ''
        tiles.append(f'<li class="grid-item" data-kind="{kind}"><a class="grid-thumb" href="{src}" data-type="{kind}" '
                     f'data-caption="{caption}" target="_blank" rel="noopener noreferrer">'
                     f'<img src="{thumb}" alt="{alt}" loading="lazy" decoding="async">{badge}</a></li>')
    total = len(media)
    videos = sum(item.get('type') == 'video' for item in media)
    return ('<section class="section" id="photos" aria-labelledby="photos-heading">'
            '<p class="kicker">THE ORIGINAL CO-PILOT / PHOTO WALL</p>'
            '<h2 id="photos-heading">Life with Birdy.</h2>'
            f'<p class="micro" id="photo-wall-help">{total} photos and videos. Pick any one to see it full size, then use the arrows, arrow keys or a swipe to keep going.</p>'
            '<div class="gallery-tools" data-gallery-tools hidden><div class="filterbar" role="group" aria-label="Show">'
            f'<button type="button" data-gallery-filter="all" aria-pressed="true">All <span>{total}</span></button>'
            f'<button type="button" data-gallery-filter="image" aria-pressed="false">Photos <span>{total - videos}</span></button>'
            f'<button type="button" data-gallery-filter="video" aria-pressed="false">Videos <span>{videos}</span></button></div></div>'
            f'<ul class="photo-grid" data-gallery data-batch="{BATCH}" aria-describedby="photo-wall-help">' + ''.join(tiles) + '</ul>'
            '<div class="gallery-more" data-gallery-more hidden><p class="micro" data-gallery-status role="status" aria-live="polite"></p>'
            '<button class="button" type="button" data-gallery-next>Show more</button>'
            '<button class="button secondary" type="button" data-gallery-all>Show everything</button></div>'
            '<dialog class="lightbox" data-lightbox aria-labelledby="lightbox-caption">'
            '<div class="lightbox-bar"><p class="micro" data-lightbox-count></p>'
            '<a class="lightbox-open" data-lightbox-open href="#photos" target="_blank" rel="noopener noreferrer">Open original ↗</a>'
            '<button class="lightbox-close" type="button" data-lightbox-close aria-label="Close viewer">✕</button></div>'
            '<div class="lightbox-stage" data-lightbox-stage></div>'
            '<div class="lightbox-foot"><button class="button secondary" type="button" data-lightbox-prev aria-label="Previous photo">←</button>'
            '<p id="lightbox-caption" data-lightbox-caption></p>'
            '<button class="button secondary" type="button" data-lightbox-next aria-label="Next photo">→</button></div></dialog>'
            f'<div class="actions"><a class="button secondary" href="https://www.instagram.com/nerdy.dirty.birdy/" target="_blank" rel="noopener noreferrer">More on @nerdy.dirty.birdy ↗</a>'
            f'<a class="button secondary" href="{ALBUM}" target="_blank" rel="noopener noreferrer">Google Photos album ↗</a></div>'
            '<p class="micro">Public copies are optimized for the web and stripped of embedded metadata.</p></section>')
