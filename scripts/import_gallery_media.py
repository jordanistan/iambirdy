#!/usr/bin/env python3
"""Create metadata-free, web-sized gallery copies from local Birdy masters."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'Birdy'
# Unzipped "Download your information" export from @nerdy.dirty.birdy; optional.
INSTAGRAM = ROOT / 'instagram'
# Only media the export lists as live posts or reels; deleted, archived and profile items stay out.
INSTAGRAM_INDEXES = ('posts.json', 'posts_1.json', 'reels.json')
INSTAGRAM_DELETED = 'recently_deleted_content.json'
DESTINATION = ROOT / 'site-assets' / 'gallery'
MANIFEST = ROOT / 'birdy-gallery.json'
IMAGES = {'.jpg', '.jpeg', '.png', '.webp', '.dng'}
VIDEOS = {'.mp4', '.mov', '.m4v', '.webm'}


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def opaque_name(path: Path, extension: str) -> str:
    with path.open('rb') as source:
        digest = hashlib.file_digest(source, 'sha256').hexdigest()[:16]
    return f'birdy-{digest}.{extension}'


def instagram_uris(value) -> dict[str, int]:
    found = {}
    if isinstance(value, dict):
        if isinstance(value.get('uri'), str) and value['uri']:
            found[value['uri']] = value.get('creation_timestamp', 0)
        for child in value.values():
            found.update(instagram_uris(child))
    elif isinstance(value, list):
        for child in value:
            found.update(instagram_uris(child))
    return found


def instagram_sources() -> list[Path]:
    index = INSTAGRAM / 'your_instagram_activity' / 'media'
    if not index.is_dir():
        return []
    live = {}
    for name in INSTAGRAM_INDEXES:
        if (index / name).is_file():
            live.update(instagram_uris(json.loads((index / name).read_text())))
    if (index / INSTAGRAM_DELETED).is_file():
        for uri in instagram_uris(json.loads((index / INSTAGRAM_DELETED).read_text())):
            live.pop(uri, None)
    sources = []
    for uri, created in sorted(live.items(), key=lambda item: (-item[1], item[0])):
        path = (INSTAGRAM / uri).resolve()
        if not path.is_relative_to(INSTAGRAM.resolve()) or path.suffix.lower() not in IMAGES | VIDEOS:
            continue
        if not path.is_file():
            raise SystemExit(f'Instagram export lists a missing file: {uri}')
        sources.append(path)
    return sources


def convert_image(source: Path, destination: Path) -> None:
    run(['magick', str(source), '-auto-orient', '-strip', '-resize', '1600x1600>',
         '-quality', '78', '-define', 'webp:method=5', str(destination)])


def convert_video(source: Path, destination: Path) -> None:
    run(['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error', '-y',
         '-i', str(source), '-map_metadata', '-1', '-map_chapters', '-1',
         '-vf', 'scale=1280:1280:force_original_aspect_ratio=decrease:force_divisible_by=2',
         '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30', '-pix_fmt', 'yuv420p',
         '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', str(destination)])


def main() -> None:
    if not SOURCE.is_dir():
        raise SystemExit(f'Missing local source folder: {SOURCE}')
    if not shutil.which('magick') or not shutil.which('ffmpeg'):
        raise SystemExit('ImageMagick and ffmpeg are required')
    DESTINATION.mkdir(parents=True, exist_ok=True)
    sources = [ROOT / 'iambirdy.jpg'] + sorted(
        (path for path in SOURCE.iterdir()
         if path.is_file() and path.suffix.lower() in IMAGES | VIDEOS),
        key=lambda path: path.name.casefold()) + instagram_sources()
    manifest = []
    expected = set()
    for number, source in enumerate(sources, 1):
        is_video = source.suffix.lower() in VIDEOS
        filename = opaque_name(source, 'mp4' if is_video else 'webp')
        destination = DESTINATION / filename
        if filename in expected:
            continue
        expected.add(filename)
        if not destination.exists():
            print(f'[{number}/{len(sources)}] {"video" if is_video else "image"}: {source.name}', flush=True)
            (convert_video if is_video else convert_image)(source, destination)
        is_hero = source == ROOT / 'iambirdy.jpg'
        from_instagram = source.is_relative_to(INSTAGRAM.resolve())
        kind = 'video' if is_video else 'photo'
        manifest.append({
            'src': f'site-assets/gallery/{filename}',
            'type': 'video' if is_video else 'image',
            'alt': ("Birdy, a speckled brown and white dog wearing a pink collar, looking toward the camera outdoors"
                    if is_hero else f"{kind.capitalize()} from Birdy's Instagram" if from_instagram
                    else "Video from Birdy's collection" if is_video
                    else "Photo from Birdy's collection"),
            'caption': ("Meet Birdy. The original photo from her website."
                        if is_hero else f"A {kind} from @nerdy.dirty.birdy on Instagram." if from_instagram
                        else "A video from Birdy's collection." if is_video
                        else "A moment from Birdy's photo collection.")
        })
    for stale in DESTINATION.iterdir():
        if stale.is_file() and stale.name not in expected:
            stale.unlink()
    MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Prepared {len(manifest)} metadata-free gallery items')


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError as error:
        raise SystemExit(error.returncode) from error
