"""Render fallback visual scenes for Addrway TikTok videos."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]


def load_config() -> Dict:
    return json.loads((ROOT / "config.json").read_text())


def get_font(size: int):
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf", size)
    except OSError:
        return ImageFont.load_default()


def gradient_background(width: int, height: int, top: str, bottom: str) -> Image.Image:
    img = Image.new("RGB", (width, height), top)
    draw = ImageDraw.Draw(img)
    tr, tg, tb = tuple(int(top[i : i + 2], 16) for i in (1, 3, 5))
    br, bg, bb = tuple(int(bottom[i : i + 2], 16) for i in (1, 3, 5))
    for y in range(height):
        blend = y / max(height - 1, 1)
        color = (
            int(tr + (br - tr) * blend),
            int(tg + (bg - tg) * blend),
            int(tb + (bb - tb) * blend),
        )
        draw.line((0, y, width, y), fill=color)
    return img


def draw_ui_mockup(draw: ImageDraw.ImageDraw, width: int, height: int, visual: str):
    panel = (90, 360, width - 90, height - 420)
    draw.rounded_rectangle(panel, radius=34, fill=(255, 255, 255, 35), outline=(255, 255, 255, 130), width=3)
    font_small = get_font(44)
    base_x, base_y = 140, 430

    if visual == "dashboard":
        draw.text((base_x, base_y), "ADDRWAY DASHBOARD", fill="white", font=font_small)
        for i, w in enumerate([280, 220, 320]):
            y = base_y + 120 + i * 82
            draw.rounded_rectangle((base_x, y, base_x + w, y + 42), radius=16, fill=(102, 231, 255, 180))
    elif visual == "warning":
        draw.text((base_x, base_y), "Delivery Exceptions", fill="white", font=font_small)
        for i, row in enumerate(["Invalid ZIP", "Wrong city", "Missing apt"]):
            draw.text((base_x, base_y + 120 + i * 90), f"⚠ {row}", fill="#FFD1D1", font=get_font(40))
    elif visual == "upload":
        draw.text((base_x, base_y), "CSV Upload", fill="white", font=font_small)
        draw.rounded_rectangle((base_x, base_y + 120, width - 140, base_y + 290), radius=20, outline="#66E7FF", width=4)
        draw.text((base_x + 50, base_y + 180), "drop addresses.csv", fill="#66E7FF", font=get_font(38))
    elif visual == "validate":
        draw.text((base_x, base_y), "API Validation", fill="white", font=font_small)
        for i in range(4):
            y = base_y + 110 + i * 85
            draw.text((base_x, y), "✓", fill="#34D399", font=get_font(48))
            draw.rounded_rectangle((base_x + 65, y + 10, width - 170, y + 50), radius=14, fill=(255, 255, 255, 160))
    elif visual == "results":
        draw.text((base_x, base_y), "Validated Results", fill="white", font=font_small)
        draw.ellipse((base_x, base_y + 110, base_x + 170, base_y + 280), fill="#34D399")
        draw.text((base_x + 45, base_y + 160), "97%", fill="#003B2A", font=get_font(48))
        draw.text((base_x + 210, base_y + 175), "deliverability score", fill="white", font=get_font(34))
    elif visual == "cta":
        draw.text((base_x, base_y), "Addrway", fill="white", font=get_font(76))
        draw.text((base_x, base_y + 120), "Validate smarter", fill="#66E7FF", font=get_font(48))
        draw.rounded_rectangle((base_x, base_y + 250, width - 170, base_y + 365), radius=24, fill="#34D399")
        draw.text((base_x + 35, base_y + 282), "Start free validation", fill="#003B2A", font=get_font(42))


def render_scene_images() -> List[Path]:
    config = load_config()
    width, height = config["project"]["width"], config["project"]["height"]
    palette = config["style"]["palette"]
    out_dir = ROOT / "output" / "scenes"
    out_dir.mkdir(parents=True, exist_ok=True)
    rendered = []

    for scene in config["scenes"]:
        img = gradient_background(width, height, palette["bg_top"], palette["bg_bottom"])
        draw = ImageDraw.Draw(img, "RGBA")
        draw_ui_mockup(draw, width, height, scene["visual"])

        caption = scene["text"]
        font = get_font(62)
        box_y = height - 420
        draw.rounded_rectangle((70, box_y, width - 70, box_y + 220), radius=28, fill=(11, 29, 57, 190))
        draw.multiline_text((110, box_y + 40), caption, fill="white", font=font, spacing=8)

        file_path = out_dir / f"scene_{scene['id']:02d}.png"
        img.save(file_path)
        rendered.append(file_path)
    return rendered


if __name__ == "__main__":
    files = render_scene_images()
    print(f"Rendered {len(files)} scenes")
