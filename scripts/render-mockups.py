"""Export gallery images from native screenshots and original app artwork."""

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parent.parent
DESIGN = ROOT / "design/mockups"
OUTPUT = ROOT / "apps/ajigu/public/gallery"
SIZE = (1600, 1200)


def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def device_image(template, screenshot, background):
    frame = Image.open(ROOT / template["file"]).convert("RGBA")
    mask = Image.open(ROOT / template["mask"]).getchannel("A")
    points = template["screen"]
    left, top = min(p[0] for p in points), min(p[1] for p in points)
    right, bottom = max(p[0] for p in points), max(p[1] for p in points)
    bounds = (right - left, bottom - top)
    screen = Image.new("RGBA", bounds, background)
    shot = Image.open(ROOT / screenshot).convert("RGBA")
    shot = ImageOps.contain(shot, bounds, Image.Resampling.LANCZOS)
    screen.alpha_composite(shot, ((bounds[0] - shot.width) // 2, (bounds[1] - shot.height) // 2))
    layer = Image.new("RGBA", frame.size)
    layer.alpha_composite(screen, (left, top))
    layer.putalpha(ImageChops.multiply(layer.getchannel("A"), mask))
    result = Image.alpha_composite(layer, frame)
    return result.crop(result.getbbox())


def main():
    templates = json.loads((DESIGN / "templates.json").read_text())
    products = json.loads((DESIGN / "products.json").read_text())
    outputs, gallery = {}, {}
    for product, item in products.items():
        canvas = Image.new("RGB", SIZE, "#efefef")
        count = len(item["screens"])
        cell_width = (SIZE[0] - 180) // count
        devices = []
        for source in item["screens"]:
            if item.get("artwork"):
                device = Image.open(ROOT / source).convert("RGBA")
                device = ImageOps.contain(device, (970, 970), Image.Resampling.LANCZOS)
                mask = Image.new("L", device.size)
                ImageDraw.Draw(mask).rounded_rectangle((0, 0, device.width, device.height), radius=device.width * 0.22, fill=255)
                device.putalpha(ImageChops.multiply(device.getchannel("A"), mask))
            else:
                device = device_image(templates[item["template"]], source, item["screenBackground"])
            device.thumbnail((cell_width - (22 if count > 1 else 0), 970), Image.Resampling.LANCZOS)
            devices.append(device)
        gap = 36
        x = (SIZE[0] - sum(device.width for device in devices) - gap * (count - 1)) // 2
        for device in devices:
            y = (SIZE[1] - device.height) // 2
            canvas.paste(device, (x, y), device)
            x += device.width + gap
        filename = f"{product}-mockup.webp"
        target = OUTPUT / filename
        canvas.save(target, quality=92, method=6)
        gallery[product] = {"file": filename, "width": SIZE[0], "height": SIZE[1]}
        outputs[product] = {
            "file": str(target.relative_to(ROOT)),
            "sha256": digest(target),
            "template": item.get("template"),
            "screens": [{"file": source, "sha256": digest(ROOT / source)} for source in item["screens"]],
        }
    (DESIGN / "outputs.json").write_text(json.dumps(outputs, indent=2) + "\n")
    (ROOT / "apps/ajigu/src/content/gallery.json").write_text(json.dumps(gallery, indent=2) + "\n")
    print(f"Rendered {len(outputs)} front-view mockups at {SIZE[0]}x{SIZE[1]}.")


if __name__ == "__main__":
    main()
