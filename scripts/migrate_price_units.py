"""
One-off migration: back-fill `unit` field on existing model `prices` based on
label heuristics. Idempotent — safe to re-run.

  - Label contains "stunde" / "h " / endswith "h" → "hour"
  - Label contains "overnight" / "nacht"        → "night"
  - Label contains "wochenende" / "weekend"     → "weekend"
  - Label contains "tag" / "day"                → "day"
  - Label contains "dinner" / "package" / "paket" → "flat"
  - else                                         → "hour"
"""
import asyncio
import os
import re
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


def infer_unit(label: str) -> str:
    l = (label or "").lower()
    if "dinner" in l or "package" in l or "paket" in l:
        return "flat"
    if "wochenende" in l or "weekend" in l:
        return "weekend"
    if "overnight" in l or "nacht" in l:
        return "night"
    if "tag" in l or re.search(r"\bday\b", l):
        return "day"
    if "stunde" in l or re.search(r"\d+\s*h\b", l) or re.search(r"\bhour\b", l):
        return "hour"
    return "hour"


async def main() -> None:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    cursor = db.models.find({"prices": {"$exists": True, "$ne": []}})
    updated = 0
    async for doc in cursor:
        prices = doc.get("prices") or []
        changed = False
        new_prices = []
        for p in prices:
            if "unit" not in p or not p.get("unit"):
                p = {**p, "unit": infer_unit(p.get("label", ""))}
                changed = True
            new_prices.append(p)
        if changed:
            await db.models.update_one(
                {"_id": doc["_id"]},
                {"$set": {"prices": new_prices}},
            )
            updated += 1
            print(f"  ✓ {doc.get('slug')}: {[(p['label'], p['unit']) for p in new_prices]}")
    print(f"\nMigration complete. Updated {updated} model(s).")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
