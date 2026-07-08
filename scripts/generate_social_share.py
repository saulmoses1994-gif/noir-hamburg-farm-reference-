"""
Generate a 1200×630 landscape social share image for Noir Hamburg via
Gemini Nano Banana, then downscale/pad to exact WhatsApp/OG spec.
Saves the output to /tmp/noir_social_share.jpg.
"""
import asyncio
import base64
import io
import os
import sys
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
from PIL import Image

load_dotenv("/app/backend/.env")

PROMPT = (
    "A cinematic wide landscape photograph of Hamburg at night — the illuminated "
    "Elbphilharmonie silhouetted against a moody dark sky, with soft warm reflections "
    "on the Elbe river. Dark editorial fashion-magazine aesthetic, obsidian black and "
    "deep burgundy tones, faint champagne gold highlights on the architecture. "
    "Ultra-elegant, sophisticated, hanseatic. No people, no faces, no text. "
    "16:9 landscape composition, subject anchored in the right third so the left "
    "third stays empty for text overlay. Rich contrast, subtle film grain, "
    "high-end luxury travel magazine cover style."
)


async def main() -> None:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing", file=sys.stderr)
        sys.exit(1)

    chat = (
        LlmChat(
            api_key=api_key,
            session_id="noir-social-share-2026-02",
            system_message="You are an elite editorial image director.",
        )
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )

    _, images = await chat.send_message_multimodal_response(UserMessage(text=PROMPT))
    if not images:
        print("no images returned", file=sys.stderr)
        sys.exit(1)

    raw = base64.b64decode(images[0]["data"])
    with open("/tmp/noir_social_share_raw.png", "wb") as fh:
        fh.write(raw)

    # Force exact 1200×630 via cover-crop, then export as high-quality JPEG.
    src = Image.open(io.BytesIO(raw)).convert("RGB")
    target_w, target_h = 1200, 630
    src_ratio = src.width / src.height
    target_ratio = target_w / target_h

    if src_ratio > target_ratio:
        new_h = target_h
        new_w = round(src.width * target_h / src.height)
    else:
        new_w = target_w
        new_h = round(src.height * target_w / src.width)

    resized = src.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    cropped = resized.crop((left, top, left + target_w, top + target_h))

    out = "/tmp/noir_social_share.jpg"
    cropped.save(out, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"saved {out}: {cropped.size}, {os.path.getsize(out)} bytes")


if __name__ == "__main__":
    asyncio.run(main())
