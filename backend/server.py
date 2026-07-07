"""Noir Hamburg — Premium Escort Agency Backend
FastAPI + MongoDB + JWT Auth + Emergent Object Storage
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import re
import bcrypt
import bleach
import jwt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated, Dict, Any

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File, Header, Query
from fastapi.responses import Response as FastResponse, PlainTextResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict, BeforeValidator
from bson import ObjectId


# ---------- App Setup ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Noir Hamburg API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
APP_NAME = os.environ.get("APP_NAME", "noir-hamburg")

# ---------- HTML sanitization (admin-authored rich-text) ----------
# Defense-in-depth against stored-XSS via a compromised admin account.
# Whitelist editorial markup only — block <script>, <style>, event handlers,
# javascript: URLs, etc. Output of this sanitizer is safe to interpolate into
# SSR HTML without further escaping.
SAFE_TAGS = [
    "p", "br", "hr", "strong", "em", "b", "i", "u", "s",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img",
    "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
    "span", "div",
]
SAFE_ATTRS = {
    "*": ["class", "id"],
    "a": ["href", "title", "target", "rel"],
    "img": ["src", "alt", "title", "width", "height", "loading"],
}
SAFE_PROTOCOLS = ["http", "https", "mailto", "tel"]


def sanitize_html(raw: str) -> str:
    """Strip dangerous tags/attrs/protocols from admin-authored rich-text."""
    if not raw:
        return ""
    return bleach.clean(
        raw,
        tags=SAFE_TAGS,
        attributes=SAFE_ATTRS,
        protocols=SAFE_PROTOCOLS,
        strip=True,
        strip_comments=True,
    )

# ---------- Storage (Emergent Object Storage) ----------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
storage_key = None


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_KEY:
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not available")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 403:
        # Re-init
        global storage_key
        storage_key = None
        key = init_storage()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not available")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------- Auth Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(hours=8),
               "type": "access"}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id,
               "exp": datetime.now(timezone.utc) + timedelta(days=7),
               "type": "refresh"}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[äÄ]", "ae", text)
    text = re.sub(r"[öÖ]", "oe", text)
    text = re.sub(r"[üÜ]", "ue", text)
    text = re.sub(r"[ß]", "ss", text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


# ---------- Pydantic Schemas ----------
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class Price(BaseModel):
    """A single pricing tier shown on a model's public profile.

    Examples:
      {label: "1 Stunde", amount: 500, currency: "EUR"}
      {label: "Dinner Date (4h)", amount: 1500, currency: "EUR"}
      {label: "Overnight", amount: 2500, currency: "EUR"}

    Multiple tiers are listed in order; the lowest amount drives the
    "ab X EUR" / "from X EUR" teaser shown on listing cards.
    """
    label: str
    amount: int  # whole units (EUR/USD/CHF)
    currency: str = "EUR"
    # Display unit, rendered as a suffix on the public profile.
    # Allowed: "hour" (default), "flat" (no suffix), "night", "day", "weekend".
    unit: str = "hour"


class ModelCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    name: str
    age: int
    bio: str
    short_tagline: Optional[str] = ""
    # Optional English translations for the public-facing detail page. When
    # present (non-empty) we serve them on /en/models/:slug and drop the
    # "EN preview" banner for that record. When empty, the German fields are
    # used as a fallback and the banner is shown to set expectations.
    bio_en: Optional[str] = ""
    short_tagline_en: Optional[str] = ""
    height_cm: Optional[int] = None
    languages: List[str] = []
    services: List[str] = []  # service slugs
    locations: List[str] = []  # location slugs
    hair_color: Optional[str] = ""
    eye_color: Optional[str] = ""
    dress_size: Optional[str] = ""
    measurements: Optional[str] = ""
    cover_image: Optional[str] = ""
    gallery: List[str] = []
    available: bool = True
    featured: bool = False
    nationality: Optional[str] = ""
    interests: List[str] = []
    # Optional editorial fields (rendered on the model detail page when set).
    personality: Optional[str] = ""       # 1–2 sentence character sketch
    personality_en: Optional[str] = ""
    availability: Optional[str] = ""      # free-text availability window
    availability_en: Optional[str] = ""
    # Tiered pricing list (admin-managed). Empty list → no price shown.
    prices: List[Price] = []
    # SEO overrides — optional. Empty → auto-derived from name+tagline.
    meta_title: Optional[str] = ""
    meta_description: Optional[str] = ""
    meta_title_en: Optional[str] = ""
    meta_description_en: Optional[str] = ""


class ModelUpdate(ModelCreate):
    pass


class SiteSettings(BaseModel):
    """Global site-wide settings, editable through the admin CMS.

    Rendered by the public site (React + SSR) via GET /api/settings and
    replaces the previously hardcoded BRAND object in data/site.js.
    """
    business_name: str = "Noir Hamburg"
    tagline_de: str = "Premium Begleitagentur · Hamburg"
    tagline_en: str = "Premium Companion Agency · Hamburg"
    phone: str = "+49 40 0000 0000"
    email: EmailStr = "kontakt@noir-hamburg.de"
    whatsapp_number: str = "+4940000000000"  # digits only, used to build wa.me URL
    hours_de: str = "Mo – Fr · 10 – 22 Uhr  ·  Sa, So, Feiertag · 13 – 22 Uhr"
    hours_en: str = "Mon – Fri · 10 am – 10 pm  ·  Sat, Sun, Holidays · 1 pm – 10 pm"
    instagram_url: Optional[str] = ""
    facebook_url: Optional[str] = ""
    twitter_url: Optional[str] = ""
    # Homepage hero image — falls back to the first featured model's cover
    # image when empty. Editable from Admin → Einstellungen.
    homepage_hero_image: Optional[str] = ""
    # Per-area cover-image overrides for the /areas page. Keyed by the
    # location slug (e.g. "hafencity" → "https://…/hafencity-photo.jpg").
    # Any slug missing here falls back to the static default in site.js.
    area_images: Dict[str, str] = {}


class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str = Field(min_length=10)


class BlogPostCreate(BaseModel):
    title: str
    excerpt: str
    content: str  # HTML / markdown content
    # Optional English translation. Stored alongside the German copy; SSR + SPA
    # pick the language-appropriate field at request time. content_en is run
    # through the same bleach sanitiser as content (defense-in-depth XSS).
    title_en: Optional[str] = ""
    excerpt_en: Optional[str] = ""
    content_en: Optional[str] = ""
    category: str
    cover_image: Optional[str] = ""
    meta_title: Optional[str] = ""
    meta_description: Optional[str] = ""
    meta_title_en: Optional[str] = ""
    meta_description_en: Optional[str] = ""
    related_services: List[str] = []
    related_locations: List[str] = []
    # Optional FAQ block appended to the article (rendered on public detail
    # page + emitted as FAQPage JSON-LD). Each entry: {q, a, q_en?, a_en?}.
    faqs: List[Dict[str, Any]] = []
    published: bool = True


class BlogPostUpdate(BlogPostCreate):
    pass


class PageCreate(BaseModel):
    """A CMS-managed arbitrary landing page (e.g. neighborhood expansion, seasonal campaign)."""
    title: str
    h1: Optional[str] = ""
    intro: Optional[str] = ""
    content: str  # HTML
    hero_image: Optional[str] = ""
    meta_title: Optional[str] = ""
    meta_description: Optional[str] = ""
    related_services: List[str] = []
    related_locations: List[str] = []
    published: bool = True


class PageUpdate(PageCreate):
    pass


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    message: str
    model_slug: Optional[str] = ""
    service: Optional[str] = ""
    date: Optional[str] = ""
    location: Optional[str] = ""
    # Honeypot field — real users leave it empty; bots fill all visible fields.
    company: Optional[str] = ""


# ---------- Auth Endpoints ----------
@api_router.post("/auth/login")
async def login(payload: LoginInput, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    user_id = str(user["_id"])
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=8*3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=7*86400, path="/")
    # SEC: don't echo the access_token in the body — httpOnly cookies are the
    # only intended transport; returning it here would undermine that protection.
    return {"id": user_id, "email": email, "name": user.get("name"), "role": user.get("role")}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"], "name": user.get("name"), "role": user.get("role")}


@api_router.post("/auth/change-password")
async def change_password(payload: ChangePasswordInput, user: dict = Depends(require_admin)):
    """Admin self-service password rotation. Requires the current password
    (defense against session-hijack scenarios) and a new one ≥ 10 chars.
    Bcrypt cost stays at library default (12 rounds)."""
    db_user = await db.users.find_one({"_id": ObjectId(user["_id"])})
    if not db_user or not verify_password(payload.current_password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Aktuelles Passwort ist nicht korrekt")
    if payload.new_password == payload.current_password:
        raise HTTPException(status_code=400, detail="Neues Passwort muss sich vom aktuellen unterscheiden")
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"password_hash": hash_password(payload.new_password)}},
    )
    return {"ok": True}


# ---------- Site Settings ----------
_SETTINGS_KEY = "singleton"  # single-document collection


def _settings_defaults() -> dict:
    return SiteSettings().model_dump()


@api_router.get("/settings")
async def get_settings():
    """Public: returns the current site-wide settings (contact info, hours,
    social links). Auto-creates the singleton document with defaults on first
    read so the site never breaks if the admin has not saved yet."""
    doc = await db.site_settings.find_one({"_key": _SETTINGS_KEY})
    if not doc:
        defaults = _settings_defaults()
        await db.site_settings.insert_one({"_key": _SETTINGS_KEY, **defaults})
        return defaults
    doc.pop("_id", None)
    doc.pop("_key", None)
    return doc


@api_router.put("/settings")
async def update_settings(payload: SiteSettings, _: dict = Depends(require_admin)):
    """Admin-only: overwrite the singleton settings document. All fields
    required (Pydantic model validation ensures shape)."""
    data = payload.model_dump()
    await db.site_settings.update_one(
        {"_key": _SETTINGS_KEY},
        {"$set": data},
        upsert=True,
    )
    return data


# ---------- Media Library ----------
@api_router.get("/media")
async def list_media(_: dict = Depends(require_admin), limit: int = 500):
    """Admin-only: paginated list of uploaded files (metadata only)."""
    cursor = db.files.find({"is_deleted": {"$ne": True}}).sort("created_at", -1).limit(limit)
    items = []
    async for doc in cursor:
        items.append({
            "id": doc.get("id"),
            "storage_path": doc.get("storage_path"),
            "original_filename": doc.get("original_filename"),
            "content_type": doc.get("content_type"),
            "size": doc.get("size"),
            "created_at": doc.get("created_at"),
            "url": f"/api/files/{doc.get('storage_path')}",
        })
    return items


@api_router.delete("/media/{file_id}")
async def delete_media(file_id: str, _: dict = Depends(require_admin)):
    """Soft-delete an uploaded file. Kept as a soft delete so any historical
    references (older blog posts, models) don't hard-fail — they just 404 on
    /api/files/... which the admin can then repair."""
    result = await db.files.update_one({"id": file_id}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"ok": True}


# ---------- Sitemap status (admin dashboard widget) ----------
@api_router.get("/sitemap/status")
async def sitemap_status(_: dict = Depends(require_admin)):
    """Return counts of every URL type currently in the sitemap, for the
    admin dashboard widget. Cheap enough to compute on-demand — < 20ms."""
    static_count = 9  # matches the static_pages list in sitemap()
    service_count = len(SERVICE_SLUGS)
    location_count = len(LOCATION_SLUGS)
    model_count = await db.models.count_documents({})
    blog_count = await db.blog.count_documents({"published": True})
    page_count = await db.pages.count_documents({"published": True})
    total = static_count + service_count + location_count + model_count + blog_count + page_count
    return {
        "total": total,
        "static": static_count,
        "services": service_count,
        "locations": location_count,
        "models": model_count,
        "blog_posts": blog_count,
        "pages": page_count,
        "sitemap_url": "/api/sitemap.xml",
        "robots_url": "/api/robots.txt",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


# ---------- Models CRUD ----------
def _model_doc_to_public(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    if "created_at" in doc and isinstance(doc["created_at"], datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc


@api_router.get("/models")
async def list_models(featured: Optional[bool] = None, location: Optional[str] = None, service: Optional[str] = None, limit: int = 100):
    query = {}
    if featured is not None:
        query["featured"] = featured
    if location:
        query["locations"] = location
    if service:
        query["services"] = service
    docs = await db.models.find(query).sort("featured", -1).limit(limit).to_list(limit)
    return [_model_doc_to_public(d) for d in docs]


@api_router.get("/models/{slug}")
async def get_model(slug: str):
    doc = await db.models.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Model not found")
    return _model_doc_to_public(doc)


@api_router.post("/models")
async def create_model(payload: ModelCreate, _: dict = Depends(require_admin)):
    base_slug = slugify(payload.name)
    slug = base_slug
    n = 1
    while await db.models.find_one({"slug": slug}):
        n += 1
        slug = f"{base_slug}-{n}"
    doc = payload.model_dump()
    doc["slug"] = slug
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.models.insert_one(doc)
    new = await db.models.find_one({"_id": result.inserted_id})
    return _model_doc_to_public(new)


@api_router.put("/models/{slug}")
async def update_model(slug: str, payload: ModelUpdate, _: dict = Depends(require_admin)):
    update_doc = payload.model_dump()
    result = await db.models.update_one({"slug": slug}, {"$set": update_doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Model not found")
    new = await db.models.find_one({"slug": slug})
    return _model_doc_to_public(new)


@api_router.delete("/models/{slug}")
async def delete_model(slug: str, _: dict = Depends(require_admin)):
    result = await db.models.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"ok": True}


# ---------- Blog CRUD ----------
def _blog_doc_to_public(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    if "created_at" in doc and isinstance(doc["created_at"], datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    if "updated_at" in doc and isinstance(doc["updated_at"], datetime):
        doc["updated_at"] = doc["updated_at"].isoformat()
    return doc


@api_router.get("/blog")
async def list_blog(request: Request, category: Optional[str] = None, limit: int = 100, include_drafts: bool = False):
    # SEC-001: drafts are admin-only. Silently ignore include_drafts unless the
    # caller authenticates as an admin so anonymous callers can never read
    # unpublished posts.
    if include_drafts:
        try:
            user = await get_current_user(request)
            if user.get("role") != "admin":
                include_drafts = False
        except HTTPException:
            include_drafts = False
    query = {} if include_drafts else {"published": True}
    if category:
        query["category"] = category
    docs = await db.blog.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    return [_blog_doc_to_public(d) for d in docs]


@api_router.get("/blog/{slug}")
async def get_blog(slug: str, request: Request):
    # Drafts must NOT be readable by anonymous users via slug guessing.
    # Same publish-gate as the listing endpoint; admins still see drafts.
    query = {"slug": slug}
    is_admin = False
    try:
        user = await get_current_user(request)
        is_admin = user.get("role") == "admin"
    except HTTPException:
        pass
    if not is_admin:
        query["published"] = True
    doc = await db.blog.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")
    return _blog_doc_to_public(doc)


@api_router.post("/blog")
async def create_blog(payload: BlogPostCreate, _: dict = Depends(require_admin)):
    base_slug = slugify(payload.title)
    slug = base_slug
    n = 1
    while await db.blog.find_one({"slug": slug}):
        n += 1
        slug = f"{base_slug}-{n}"
    doc = payload.model_dump()
    doc["content"] = sanitize_html(doc.get("content", ""))
    doc["content_en"] = sanitize_html(doc.get("content_en", ""))
    doc["slug"] = slug
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = doc["created_at"]
    result = await db.blog.insert_one(doc)
    new = await db.blog.find_one({"_id": result.inserted_id})
    return _blog_doc_to_public(new)


@api_router.put("/blog/{slug}")
async def update_blog(slug: str, payload: BlogPostUpdate, _: dict = Depends(require_admin)):
    update_doc = payload.model_dump()
    update_doc["content"] = sanitize_html(update_doc.get("content", ""))
    update_doc["content_en"] = sanitize_html(update_doc.get("content_en", ""))
    update_doc["updated_at"] = datetime.now(timezone.utc)
    result = await db.blog.update_one({"slug": slug}, {"$set": update_doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    new = await db.blog.find_one({"slug": slug})
    return _blog_doc_to_public(new)


@api_router.delete("/blog/{slug}")
async def delete_blog(slug: str, _: dict = Depends(require_admin)):
    result = await db.blog.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"ok": True}


# ---------- Contact / Bookings ----------
@api_router.post("/contact")
async def submit_contact(payload: ContactCreate):
    # Honeypot — if the hidden `company` field is filled, it's a bot.
    # Return success so spammers don't learn we're filtering.
    if payload.company:
        logger.info("Honeypot triggered for contact submission")
        return {"ok": True, "id": "noop"}
    doc = payload.model_dump()
    doc.pop("company", None)  # never persist the honeypot
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "new"
    await db.contacts.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/contact")
async def list_contacts(_: dict = Depends(require_admin)):
    docs = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).limit(500).to_list(500)
    return docs


@api_router.put("/contact/{contact_id}")
async def update_contact(contact_id: str, status: str = Query(...), _: dict = Depends(require_admin)):
    await db.contacts.update_one({"id": contact_id}, {"$set": {"status": status}})
    return {"ok": True}


# ---------- Pages CMS (arbitrary landing pages) ----------
def _page_doc_to_public(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    if "created_at" in doc and isinstance(doc["created_at"], datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    if "updated_at" in doc and isinstance(doc["updated_at"], datetime):
        doc["updated_at"] = doc["updated_at"].isoformat()
    return doc


@api_router.get("/pages")
async def list_pages(request: Request, include_drafts: bool = False):
    if include_drafts:
        try:
            user = await get_current_user(request)
            if user.get("role") != "admin":
                include_drafts = False
        except HTTPException:
            include_drafts = False
    query = {} if include_drafts else {"published": True}
    docs = await db.pages.find(query).sort("created_at", -1).limit(500).to_list(500)
    return [_page_doc_to_public(d) for d in docs]


@api_router.get("/pages/{slug}")
async def get_page(slug: str, request: Request):
    # Admins can preview drafts; everyone else only sees published pages.
    query = {"slug": slug}
    is_admin = False
    try:
        user = await get_current_user(request)
        is_admin = user.get("role") == "admin"
    except HTTPException:
        pass
    if not is_admin:
        query["published"] = True
    doc = await db.pages.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Page not found")
    return _page_doc_to_public(doc)


@api_router.post("/pages")
async def create_page(payload: PageCreate, _: dict = Depends(require_admin)):
    base_slug = slugify(payload.title)
    slug = base_slug
    n = 1
    while await db.pages.find_one({"slug": slug}):
        n += 1
        slug = f"{base_slug}-{n}"
    doc = payload.model_dump()
    doc["content"] = sanitize_html(doc.get("content", ""))
    doc["slug"] = slug
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = doc["created_at"]
    result = await db.pages.insert_one(doc)
    return _page_doc_to_public(await db.pages.find_one({"_id": result.inserted_id}))


@api_router.put("/pages/{slug}")
async def update_page(slug: str, payload: PageUpdate, _: dict = Depends(require_admin)):
    update_doc = payload.model_dump()
    update_doc["content"] = sanitize_html(update_doc.get("content", ""))
    update_doc["updated_at"] = datetime.now(timezone.utc)
    result = await db.pages.update_one({"slug": slug}, {"$set": update_doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return _page_doc_to_public(await db.pages.find_one({"slug": slug}))


@api_router.delete("/pages/{slug}")
async def delete_page(slug: str, _: dict = Depends(require_admin)):
    result = await db.pages.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"ok": True}


# ---------- File Upload ----------
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@api_router.post("/upload")
async def upload_image(request: Request, file: UploadFile = File(...), _: dict = Depends(require_admin)):
    # SEC-004: simple anti-CSRF gate. State-changing multipart endpoints skip
    # CORS preflight, so we explicitly require an Origin (or Referer) that
    # matches our allow-list. Server-to-server callers can pass through with no
    # Origin header at all — only browsers send one cross-origin.
    origin = request.headers.get("origin") or request.headers.get("referer", "")
    if origin:
        if not any(origin.startswith(allowed) for allowed in _cors_origins):
            raise HTTPException(status_code=403, detail="Cross-origin upload blocked")
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Nur Bilddateien erlaubt (JPEG, PNG, WEBP, GIF)")
    ext = (file.filename or "img").split(".")[-1].lower() if "." in (file.filename or "") else "jpg"
    object_path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Datei zu groß (max 10MB)")
    result = put_object(object_path, data, file.content_type)
    final_path = result["path"]
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": final_path,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"path": final_path, "url": f"/api/files/{final_path}"}


@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return FastResponse(content=data, media_type=record.get("content_type", content_type))


# ---------- SEO: Sitemap / robots ----------
SERVICE_SLUGS = [
    "luxury-escort-hamburg", "vip-escort-hamburg", "business-escort-hamburg",
    "dinner-companion-hamburg", "hotel-escort-hamburg", "event-escort-hamburg",
    "travel-companion-hamburg", "girlfriend-experience-hamburg",
]
LOCATION_SLUGS = [
    "hamburg", "st-pauli", "hafencity", "altona", "winterhude", "eppendorf",
    "blankenese", "harvestehude", "barmbek", "wandsbek", "norderstedt",
    "pinneberg", "reinbek", "ahrensburg", "wedel", "seevetal", "lueneburg", "elmshorn",
]


@api_router.get("/sitemap.xml", response_class=PlainTextResponse)
async def sitemap(request: Request):
    host = os.environ.get("SITE_URL", str(request.base_url).rstrip("/"))
    if host.endswith("/api"):
        host = host[:-4]

    static_pages = [
        ("/", "daily", "1.0"),
        ("/models", "daily", "0.9"),
        ("/escort-hamburg", "weekly", "0.9"),
        ("/services", "weekly", "0.8"),
        ("/areas", "weekly", "0.8"),
        ("/blog", "daily", "0.8"),
        ("/faq", "monthly", "0.6"),
        ("/ueber-uns", "monthly", "0.5"),
        ("/kontakt", "monthly", "0.6"),
    ]

    today = datetime.now(timezone.utc).date().isoformat()
    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
           'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']

    for path, freq, prio in static_pages:
        xml.append(
            f"<url><loc>{host}{path}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>{freq}</changefreq><priority>{prio}</priority></url>"
        )
    for s in SERVICE_SLUGS:
        xml.append(
            f"<url><loc>{host}/services/{s}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>monthly</changefreq><priority>0.8</priority></url>"
        )
    for loc in LOCATION_SLUGS:
        xml.append(
            f"<url><loc>{host}/escort/{loc}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>monthly</changefreq><priority>0.8</priority></url>"
        )

    # Models with their cover_image as image:image
    models = await db.models.find({}, {"slug": 1, "cover_image": 1, "created_at": 1}).to_list(2000)
    for m in models:
        lm = m.get("created_at")
        lm_str = lm.date().isoformat() if isinstance(lm, datetime) else today
        cover = (m.get("cover_image") or "").replace("&", "&amp;")
        img_tag = f"<image:image><image:loc>{cover}</image:loc></image:image>" if cover.startswith("http") else ""
        xml.append(
            f"<url><loc>{host}/models/{m['slug']}</loc><lastmod>{lm_str}</lastmod>"
            f"<changefreq>weekly</changefreq><priority>0.7</priority>{img_tag}</url>"
        )

    posts = await db.blog.find({"published": True}, {"slug": 1, "cover_image": 1, "updated_at": 1, "created_at": 1}).to_list(5000)
    for p in posts:
        lm = p.get("updated_at") or p.get("created_at")
        lm_str = lm.date().isoformat() if isinstance(lm, datetime) else today
        cover = (p.get("cover_image") or "").replace("&", "&amp;")
        img_tag = f"<image:image><image:loc>{cover}</image:loc></image:image>" if cover.startswith("http") else ""
        xml.append(
            f"<url><loc>{host}/blog/{p['slug']}</loc><lastmod>{lm_str}</lastmod>"
            f"<changefreq>monthly</changefreq><priority>0.7</priority>{img_tag}</url>"
        )

    # CMS-managed landing pages
    pages = await db.pages.find({"published": True}, {"slug": 1, "hero_image": 1, "updated_at": 1, "created_at": 1}).to_list(5000)
    for pg in pages:
        lm = pg.get("updated_at") or pg.get("created_at")
        lm_str = lm.date().isoformat() if isinstance(lm, datetime) else today
        hero = (pg.get("hero_image") or "").replace("&", "&amp;")
        img_tag = f"<image:image><image:loc>{hero}</image:loc></image:image>" if hero.startswith("http") else ""
        xml.append(
            f"<url><loc>{host}/p/{pg['slug']}</loc><lastmod>{lm_str}</lastmod>"
            f"<changefreq>monthly</changefreq><priority>0.6</priority>{img_tag}</url>"
        )

    xml.append("</urlset>")
    return PlainTextResponse("\n".join(xml), media_type="application/xml")


@api_router.get("/robots.txt", response_class=PlainTextResponse)
async def robots(request: Request):
    host = os.environ.get("SITE_URL", str(request.base_url).rstrip("/"))
    return PlainTextResponse(f"User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: {host}/api/sitemap.xml\n")


@api_router.get("/health")
async def health():
    return {"status": "ok"}


# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.models.create_index("slug", unique=True)
        await db.blog.create_index("slug", unique=True)
        await db.pages.create_index("slug", unique=True)
        await db.contacts.create_index("created_at")
    except Exception as e:
        logger.warning(f"Index creation: {e}")
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@noir-hamburg.de").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrator",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")
    # Initialize storage (non-blocking)
    init_storage()
    # Seed initial models if empty
    count = await db.models.count_documents({})
    if count == 0:
        await _seed_initial_data()


async def _seed_initial_data():
    """Seed elegant starter models so the site is functional out of the box."""
    seed_models = [
        {"name": "Aurelia", "age": 25, "nationality": "Deutsch",
         "short_tagline": "Eleganz mit klassischer Bildung",
         "bio": "Aurelia verkörpert die zeitlose Hanseatische Eleganz. Mit einem Hintergrund in Kunstgeschichte und einer Leidenschaft für klassische Musik begleitet sie Sie gleichermaßen souverän zu Konzerten in der Elbphilharmonie wie zu intimen Dinners an der Alster.",
         "height_cm": 174, "hair_color": "Kastanienbraun", "eye_color": "Grün",
         "dress_size": "36", "measurements": "85-62-90",
         "languages": ["Deutsch", "Englisch", "Französisch"],
         "services": ["luxury-escort-hamburg", "dinner-companion-hamburg", "event-escort-hamburg", "girlfriend-experience-hamburg"],
         "locations": ["hamburg", "hafencity", "harvestehude", "blankenese", "winterhude"],
         "cover_image": "https://images.unsplash.com/photo-1533392151650-269f96231f65?auto=format&fit=crop&w=1200&q=80",
         "gallery": [
             "https://images.unsplash.com/photo-1533392151650-269f96231f65?auto=format&fit=crop&w=1600&q=85",
             "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1600&q=85",
             "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
         ],
         "interests": ["Klassische Musik", "Kunstgeschichte", "Segeln"],
         "available": True, "featured": True},

        {"name": "Valentina", "age": 27, "nationality": "Italienisch",
         "short_tagline": "Mediterrane Wärme trifft norddeutsche Souveränität",
         "bio": "Geboren in Mailand, zu Hause in Hamburg. Valentina spricht fließend vier Sprachen und ist eine geschätzte Begleitung auf internationalem Parkett – ob auf einem Galadinner im Vier Jahreszeiten oder bei einem geschäftlichen Abendessen mit internationalen Partnern.",
         "height_cm": 171, "hair_color": "Dunkelblond", "eye_color": "Haselnussbraun",
         "dress_size": "36", "measurements": "86-63-91",
         "languages": ["Deutsch", "Englisch", "Italienisch", "Spanisch"],
         "services": ["vip-escort-hamburg", "business-escort-hamburg", "travel-companion-hamburg", "hotel-escort-hamburg"],
         "locations": ["hamburg", "hafencity", "altona", "eppendorf", "winterhude"],
         "cover_image": "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1200&q=80",
         "gallery": [
             "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
             "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
         ],
         "interests": ["Mode", "Yacht-Reisen", "Weinkunde"],
         "available": True, "featured": True},

        {"name": "Sophia", "age": 24, "nationality": "Deutsch",
         "short_tagline": "Junge Hanseatin mit Stil und Verstand",
         "bio": "Sophia studiert Wirtschaftsrecht an der Bucerius Law School. Ihre Eloquenz, ihr feines Lächeln und ihre natürliche Anmut machen sie zur idealen Begleitung für gehobene Geschäftsanlässe und private Abende.",
         "height_cm": 168, "hair_color": "Blond", "eye_color": "Blau",
         "dress_size": "34", "measurements": "84-61-89",
         "languages": ["Deutsch", "Englisch"],
         "services": ["business-escort-hamburg", "dinner-companion-hamburg", "luxury-escort-hamburg", "girlfriend-experience-hamburg"],
         "locations": ["hamburg", "hafencity", "eppendorf", "winterhude", "harvestehude"],
         "cover_image": "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1200&q=80",
         "gallery": [
             "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1600&q=85",
             "https://images.pexels.com/photos/19923619/pexels-photo-19923619.jpeg?auto=compress&cs=tinysrgb&w=1600",
         ],
         "interests": ["Wirtschaftsrecht", "Reiten", "Literatur"],
         "available": True, "featured": True},

        {"name": "Mila", "age": 28, "nationality": "Französisch",
         "short_tagline": "Pariser Chic an der Elbe",
         "bio": "Mila bringt einen Hauch von Paris nach Hamburg. Mit ihrer feinsinnigen Art und einem unverkennbaren Gespür für Mode begleitet sie Sie souverän auf Vernissagen, Modewochen und exklusive Events.",
         "height_cm": 173, "hair_color": "Schwarz", "eye_color": "Dunkelbraun",
         "dress_size": "36", "measurements": "85-62-90",
         "languages": ["Deutsch", "Französisch", "Englisch"],
         "services": ["event-escort-hamburg", "luxury-escort-hamburg", "travel-companion-hamburg", "vip-escort-hamburg"],
         "locations": ["hamburg", "altona", "blankenese", "hafencity", "winterhude"],
         "cover_image": "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1200&q=80",
         "gallery": [
             "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
         ],
         "interests": ["Mode", "Galerien", "Französische Küche"],
         "available": True, "featured": False},

        {"name": "Helena", "age": 30, "nationality": "Deutsch",
         "short_tagline": "Reif, raffiniert, unwiderstehlich",
         "bio": "Helena verkörpert die Reife, die nur Lebenserfahrung schenkt. Als ehemalige Kunstkuratorin bewegt sie sich mühelos zwischen den feinsten Kreisen Hamburgs und versteht es, jedem Anlass die richtige Note zu verleihen.",
         "height_cm": 176, "hair_color": "Aschblond", "eye_color": "Grün-Grau",
         "dress_size": "36", "measurements": "86-64-92",
         "languages": ["Deutsch", "Englisch", "Russisch"],
         "services": ["vip-escort-hamburg", "luxury-escort-hamburg", "dinner-companion-hamburg", "event-escort-hamburg"],
         "locations": ["hamburg", "harvestehude", "eppendorf", "blankenese"],
         "cover_image": "https://images.pexels.com/photos/19923619/pexels-photo-19923619.jpeg?auto=compress&cs=tinysrgb&w=1200",
         "gallery": [
             "https://images.pexels.com/photos/19923619/pexels-photo-19923619.jpeg?auto=compress&cs=tinysrgb&w=1600",
         ],
         "interests": ["Kunst", "Oper", "Yoga"],
         "available": True, "featured": True},

        {"name": "Lara", "age": 23, "nationality": "Deutsch",
         "short_tagline": "Strahlende Jugend mit hanseatischer Disziplin",
         "bio": "Lara studiert in ihrem letzten Semester Internationale Beziehungen. Sie ist klug, weltgewandt und besitzt jene seltene Mischung aus jugendlicher Energie und stiller Eleganz.",
         "height_cm": 169, "hair_color": "Hellbraun", "eye_color": "Blau",
         "dress_size": "34", "measurements": "82-60-88",
         "languages": ["Deutsch", "Englisch", "Spanisch"],
         "services": ["girlfriend-experience-hamburg", "dinner-companion-hamburg", "travel-companion-hamburg", "hotel-escort-hamburg"],
         "locations": ["hamburg", "st-pauli", "altona", "hafencity"],
         "cover_image": "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1200&q=80",
         "gallery": [
             "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
         ],
         "interests": ["Politik", "Reisen", "Joggen an der Alster"],
         "available": True, "featured": False},
    ]
    for m in seed_models:
        m["slug"] = slugify(m["name"])
        m["created_at"] = datetime.now(timezone.utc)
    await db.models.insert_many(seed_models)
    logger.info(f"Seeded {len(seed_models)} models")

    # Seed a few blog articles
    posts = [
        {"title": "Die zehn besten Restaurants in Hamburg für ein unvergessliches Dinner",
         "category": "Restaurants",
         "excerpt": "Von der Sterneküche im Haerlin bis zum diskreten Hideaway in der HafenCity – ein Leitfaden für gehobenes Kulinarisches in Hamburg.",
         "content": "<p>Hamburg ist eine Stadt der feinen Kontraste. Wer als Connaisseur den Abend in vollendetem Stil verbringen möchte, findet zwischen Alster und Elbe eine bemerkenswerte Dichte an Spitzengastronomie. In diesem Artikel stellen wir Ihnen zehn Adressen vor, die uns besonders ans Herz gewachsen sind – sei es für ein Geschäftsessen in eleganter Atmosphäre oder ein romantisches Dinner zu zweit.</p><h2>1. Haerlin im Fairmont Vier Jahreszeiten</h2><p>Zwei Michelin-Sterne, ein Blick auf die Binnenalster und eine Atmosphäre, die nahtlos zwischen klassischer Eleganz und moderner Avantgarde wechselt.</p><h2>2. Jacobs Restaurant</h2><p>An der Elbchaussee gelegen, mit Terrasse über dem Strom – ein Klassiker für besondere Anlässe.</p><h2>3. The Table von Kevin Fehling</h2><p>Drei Sterne, eine offene Küche, und ein Menü, das in jedem Gang erzählt.</p>",
         "cover_image": "https://images.pexels.com/photos/11541194/pexels-photo-11541194.png?auto=compress&cs=tinysrgb&w=1600",
         "meta_title": "Die 10 besten Restaurants in Hamburg | Noir Hamburg Guide",
         "meta_description": "Entdecken Sie die zehn exklusivsten Restaurants in Hamburg – kuratiert für anspruchsvolle Genießer. Sterneküche, Atmosphäre, Diskretion.",
         "related_services": ["dinner-companion-hamburg", "luxury-escort-hamburg"],
         "related_locations": ["hamburg", "hafencity", "harvestehude"],
         "published": True},

        {"title": "Hamburg bei Nacht: Ein eleganter Leitfaden durch die Stadt",
         "category": "Hamburg Guide",
         "excerpt": "Wenn die Lichter der Stadt erwachen, beginnt ein anderes Hamburg. Wir zeigen die schönsten Orte für einen kultivierten Abend.",
         "content": "<p>Hamburg verwandelt sich nach Sonnenuntergang. Die Speicherstadt leuchtet kupferfarben, die Elbphilharmonie thront wie ein Kristall über dem Hafen, und in den Bars der HafenCity wird Whisky zelebriert wie in den feinsten Salons Londons.</p><h2>Die Aussichtspunkte</h2><p>Die Plaza der Elbphilharmonie ist auch bei Nacht zugänglich und bietet einen 360°-Blick über das Lichtermeer der Stadt.</p>",
         "cover_image": "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1600",
         "meta_title": "Hamburg bei Nacht – Eleganter Stadtführer | Noir Hamburg",
         "meta_description": "Der elegante Leitfaden durch Hamburgs Nachtleben: Bars, Aussichten, Konzerte und Restaurants jenseits des Mainstreams.",
         "related_services": ["luxury-escort-hamburg", "event-escort-hamburg"],
         "related_locations": ["hamburg", "hafencity", "st-pauli"],
         "published": True},

        {"title": "Diskretion verstehen: Was Premium-Begleitung wirklich bedeutet",
         "category": "Escort Advice",
         "excerpt": "Diskretion ist kein Marketing-Versprechen, sondern eine Kultur. Wir erklären, woran Sie eine seriöse Agentur erkennen.",
         "content": "<p>Im Premiumsegment ist Diskretion nicht ein optionales Versprechen – sie ist das Fundament. Wir bei Noir Hamburg verstehen, dass unsere Kunden Persönlichkeiten von öffentlichem Rang sind, deren Privatsphäre höchsten Schutz verdient.</p><h2>Datensicherheit</h2><p>Anfragen werden ausschließlich verschlüsselt verarbeitet, persönliche Daten niemals gespeichert über das nötige Maß hinaus.</p>",
         "cover_image": "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
         "meta_title": "Diskretion bei Premium-Escortservice | Noir Hamburg",
         "meta_description": "Was zeichnet einen wahrhaft diskreten Escort-Service aus? Erfahren Sie, woran Sie Qualität und Vertraulichkeit erkennen.",
         "related_services": ["vip-escort-hamburg", "luxury-escort-hamburg"],
         "related_locations": ["hamburg"],
         "published": True},
    ]
    for p in posts:
        p["slug"] = slugify(p["title"])
        p["created_at"] = datetime.now(timezone.utc)
        p["updated_at"] = p["created_at"]
    await db.blog.insert_many(posts)
    logger.info(f"Seeded {len(posts)} blog posts")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ---------- Wire up routes + CORS ----------
app.include_router(api_router)

# SEC-002: never combine wildcard origin with credentials. Default to the known
# preview URL; production deployments should set CORS_ORIGINS to an explicit
# comma-separated list.
_default_origin = "https://client-portal-385.preview.emergentagent.com"
_cors_origins_raw = os.environ.get('CORS_ORIGINS', _default_origin)
_cors_origins = [o.strip() for o in _cors_origins_raw.split(',') if o.strip() and o.strip() != '*']
if not _cors_origins:
    _cors_origins = [_default_origin]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
