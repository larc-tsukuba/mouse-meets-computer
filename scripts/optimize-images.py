"""Generate display assets from preserved originals using ImageMagick 6/7."""
from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
CONVERT = shutil.which('magick') or shutil.which('convert')
if not CONVERT:
    raise SystemExit('ImageMagick with WebP support is required.')

sources = set()
for page in [*ROOT.glob('index*.html'), *(ROOT / 'html').glob('*.html')]:
    for image in re.findall(r'<img\b[^>]*>', page.read_text()):
        match = re.search(r'src="\./image/([^"]+)"', image)
        if not match:
            continue
        relative = match[1]
        if relative.startswith('optimized/'):
            relative = relative.removeprefix('optimized/').removesuffix('.webp')
        if relative.startswith(('header-', 'event/', 'member/circle-')):
            sources.add(ROOT / 'image' / relative)

for source in sorted(sources):
    if not source.is_file():
        continue
    relative = source.relative_to(ROOT / 'image')
    # Include the source extension to avoid collisions between JPG and PNG originals.
    target = ROOT / 'image/optimized' / relative.parent / f'{source.name}.webp'
    target.parent.mkdir(parents=True, exist_ok=True)
    header = source.name.startswith('header-')
    width = 2400 if header else 560 if relative.parts[0] == 'member' else 1600
    command = [CONVERT, str(source), '-auto-orient', '-resize', f'{width}x>', '-strip']
    command += ['-define', 'webp:lossless=true'] if header else ['-quality', '80']
    subprocess.run(command + [str(target)], check=True)
    print(f'{relative}: {source.stat().st_size:,} -> {target.stat().st_size:,} bytes', flush=True)
