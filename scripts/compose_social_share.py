"""
Compose a 1200×630 landscape social share card from a portrait source photo.
Places the subject on the right, fills the left with a dark editorial gradient
matching Noir Hamburg's brand (obsidian → deep burgundy), and adds a subtle
brand mark. Output is optimised progressive JPEG at ≤200 KB.
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC = "/tmp/source_portrait.jpg"
OUT = "/tmp/noir_social_share_v2.jpg"

TARGET_W, TARGET_H = 1200, 630
# Right-anchored panel where the subject lives; leaves a rich negative-space
# panel on the left for the brand mark.
SUBJECT_PANEL_W = 720  # right side
LEFT_PANEL_W = TARGET_W - SUBJECT_PANEL_W  # 480 px negative space
FEATHER_W = 140  # width of the soft blend between panels

BRAND_BURGUNDY = (139, 21, 56)
BRAND_INK = (26, 20, 20)
BRAND_CHAMPAGNE = (229, 165, 181)


def _cover_crop(im: Image.Image, w: int, h: int) -> Image.Image:
    """Resize+crop to exactly (w,h) preserving aspect ratio (like CSS cover)."""
    src_ratio = im.width / im.height
    target_ratio = w / h
    if src_ratio > target_ratio:
        new_h = h
        new_w = round(im.width * h / im.height)
    else:
        new_w = w
        new_h = round(im.height * w / im.width)
    resized = im.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - w) // 2
    top = (new_h - h) // 2
    return resized.crop((left, top, left + w, top + h))


def _gradient_bg(w: int, h: int) -> Image.Image:
    """Vertical + horizontal gradient — deep obsidian with a faint burgundy
    warmth on the left edge, going darker toward the seam."""
    bg = Image.new("RGB", (w, h), BRAND_INK)
    px = bg.load()
    for x in range(w):
        # Horizontal fall-off from burgundy on the far-left to obsidian on the right seam.
        t = 1 - min(x / w, 1)
        r = int(BRAND_INK[0] + (BRAND_BURGUNDY[0] * 0.35 - BRAND_INK[0]) * t)
        g = int(BRAND_INK[1] + (BRAND_BURGUNDY[1] * 0.35 - BRAND_INK[1]) * t)
        b = int(BRAND_INK[2] + (BRAND_BURGUNDY[2] * 0.35 - BRAND_INK[2]) * t)
        for y in range(h):
            # Slight top-to-bottom darkening for depth.
            vt = 1 - (y / h) * 0.35
            px[x, y] = (int(r * vt), int(g * vt), int(b * vt))
    return bg


def _load_font(size: int) -> ImageFont.FreeTypeFont:
    for p in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSerif.ttf",
    ):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def main() -> None:
    src = Image.open(SRC).convert("RGB")

    # 1. Right subject panel: cover-crop to 720×630, then push subject slightly
    #    left so the woman sits closer to the seam (natural "reading" flow).
    subject_full = _cover_crop(src, SUBJECT_PANEL_W, TARGET_H)

    # 2. Background gradient covers the whole 1200×630 canvas.
    canvas = _gradient_bg(TARGET_W, TARGET_H)

    # 3. Build a horizontal-alpha mask for the subject panel so its left edge
    #    feathers into the gradient (no visible seam).
    mask = Image.new("L", (SUBJECT_PANEL_W, TARGET_H), 255)
    md = mask.load()
    for x in range(FEATHER_W):
        alpha = int(255 * (x / FEATHER_W))
        for y in range(TARGET_H):
            md[x, y] = alpha
    # Soft blur to remove any banding on the feather.
    mask = mask.filter(ImageFilter.GaussianBlur(2))

    canvas.paste(subject_full, (LEFT_PANEL_W, 0), mask)

    # 4. Add a subtle vignette on the far-right and top corners for polish.
    vignette = Image.new("L", (TARGET_W, TARGET_H), 0)
    vd = ImageDraw.Draw(vignette)
    # Radial-ish vignette: dark corners, transparent center.
    for i in range(60):
        vd.rectangle(
            (i, i, TARGET_W - i, TARGET_H - i),
            outline=int(255 * (1 - i / 60) * 0.35),
        )
    vignette = vignette.filter(ImageFilter.GaussianBlur(35))
    dark = Image.new("RGB", (TARGET_W, TARGET_H), BRAND_INK)
    canvas = Image.composite(dark, canvas, vignette)

    # 5. Brand overlay on the left panel.
    draw = ImageDraw.Draw(canvas)
    # Small overline
    overline_font = _load_font(18)
    brand_font = _load_font(74)
    tagline_font = _load_font(22)

    x_left = 60
    y = 210
    draw.text(
        (x_left, y),
        "PREMIUM ESCORT AGENCY",
        font=overline_font,
        fill=BRAND_CHAMPAGNE,
        spacing=4,
    )
    y += 42
    draw.text((x_left, y), "Noir", font=brand_font, fill=(255, 255, 255))
    # Second line "Hamburg" in burgundy
    hamburg_x = x_left + 5
    draw.text((hamburg_x, y + 78), "Hamburg", font=brand_font, fill=BRAND_BURGUNDY)
    y += 200
    draw.text(
        (x_left, y),
        "Diskretion seit 2014",
        font=tagline_font,
        fill=(200, 190, 190),
    )

    canvas.save(OUT, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"saved {OUT}: {canvas.size}, {os.path.getsize(OUT)} bytes")


if __name__ == "__main__":
    main()
