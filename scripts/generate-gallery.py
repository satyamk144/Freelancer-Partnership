from pathlib import Path
from PIL import Image, ImageOps
import json

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "gallery-data.js"
EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}
QUALITY = 82
MAX_DIMENSION = 2200


def optimize(path: Path):
    if path.suffix.lower() == ".webp":
        return
    try:
        with Image.open(path) as im:
            im = ImageOps.exif_transpose(im)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
            w, h = im.size
            scale = min(1.0, MAX_DIMENSION / max(w, h))
            if scale < 1:
                im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.Resampling.LANCZOS)
            target = path.with_suffix(".webp")
            im.save(target, "WEBP", quality=QUALITY, method=6)
        path.unlink()
        print(f"Converted {path} -> {target}")
    except Exception as exc:
        print(f"Skipping {path}: {exc}")


for path in sorted(ASSETS.rglob("*")):
    if path.is_file() and path.suffix.lower() in EXTENSIONS and path.suffix.lower() != ".webp":
        optimize(path)

items = []
for path in sorted(ASSETS.rglob("*.webp")):
    try:
        with Image.open(path) as im:
            width, height = im.size
    except Exception:
        continue
    rel = path.relative_to(ROOT).as_posix()
    label = path.stem.replace("-", " ").replace("_", " ").strip().title()
    items.append({"src": f"./{rel}", "alt": f"{label} – Satyam Kumar", "width": width, "height": height})

js = "window.SATYAM_GALLERY = " + json.dumps(items, ensure_ascii=False, separators=(",", ":")) + ";\n"
OUTPUT.write_text(js, encoding="utf-8")
print(f"Gallery updated with {len(items)} WebP image(s).")
