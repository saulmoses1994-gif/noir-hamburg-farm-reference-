import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getDb, cleanDoc } from '@/lib/mongo'
import {
  listServiceContent, getServiceContent,
  listAreaContent, getAreaContent,
} from '@/lib/service-content'
import {
  hashPassword, verifyPassword, signToken,
  getSessionUser, requireAdmin,
  attachAuthCookie, clearAuthCookie,
} from '@/lib/auth'

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}
const j = (data, init = {}) => cors(NextResponse.json(data, init))
export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

// Editable model fields (whitelist used by POST and PUT).
const MODEL_FIELDS = [
  'name', 'short_tagline', 'short_tagline_en',
  'bio', 'bio_en',
  'cover_image', 'gallery',
  'age', 'height_cm', 'measurements', 'dress_size',
  'hair_color', 'eye_color', 'nationality',
  'languages', 'interests', 'services', 'locations',
  'prices',
  'meta_title', 'meta_title_en',
  'meta_description', 'meta_description_en',
  'featured', 'available',
]

// Editable page fields.
const PAGE_FIELDS = [
  'title', 'h1', 'intro', 'content',
  'hero_image',
  'meta_title', 'meta_description',
  'related_services', 'related_locations',
  'published',
]

// Editable blog fields.
const BLOG_FIELDS = [
  'title', 'title_en',
  'category',
  'excerpt', 'excerpt_en',
  'content', 'content_en',
  'cover_image',
  'meta_title', 'meta_title_en',
  'meta_description', 'meta_description_en',
  'related_services', 'related_locations',
  'published',
]

async function readJson(request) {
  try { return await request.json() } catch { return {} }
}

async function route(request, ctx, method) {
  const params = await ctx.params
  const parts = params?.path || []
  const p = '/' + parts.join('/')

  try {
    // ---------- Health ----------
    if ((p === '/' || p === '/health') && method === 'GET') {
      return j({ status: 'ok', service: 'noir-hamburg-nextjs', time: new Date().toISOString() })
    }

    // ---------- Auth ----------
    if (p === '/auth/login' && method === 'POST') {
      const { email, password } = await readJson(request)
      if (!email || !password) return j({ detail: 'Email and password required' }, { status: 400 })
      const db = await getDb()
      const user = await db.collection('users').findOne({ email: String(email).toLowerCase().trim() })
      if (!user) return j({ detail: 'Invalid credentials' }, { status: 401 })
      const ok = await verifyPassword(password, user.password_hash)
      if (!ok) return j({ detail: 'Invalid credentials' }, { status: 401 })
      const clean = cleanDoc(user); delete clean.password_hash
      const token = signToken({ id: user.id || String(user._id), email: user.email, role: user.role })
      const res = cors(NextResponse.json({ user: clean }))
      return attachAuthCookie(res, token)
    }

    if (p === '/auth/logout' && method === 'POST') {
      const res = cors(NextResponse.json({ ok: true }))
      return clearAuthCookie(res)
    }

    if (p === '/auth/me' && method === 'GET') {
      const user = await getSessionUser(request)
      if (!user) return j({ detail: 'Not authenticated' }, { status: 401 })
      return j({ user })
    }

    if (p === '/auth/change-password' && method === 'POST') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const { current_password, new_password } = await readJson(request)
      if (!current_password || !new_password) return j({ detail: 'Missing fields' }, { status: 400 })
      if (String(new_password).length < 8) return j({ detail: 'New password too short (min 8 chars)' }, { status: 400 })
      const db = await getDb()
      const user = await db.collection('users').findOne({ email: guard.user.email })
      if (!user) return j({ detail: 'User not found' }, { status: 404 })
      const ok = await verifyPassword(current_password, user.password_hash)
      if (!ok) return j({ detail: 'Current password is incorrect' }, { status: 400 })
      const newHash = await hashPassword(new_password)
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { password_hash: newHash, updated_at: new Date() } }
      )
      return j({ ok: true })
    }

    // ---------- Admin: Service content write ----------
    // PUT /api/admin/service-content/:slug \u2014 partial update, whitelisted fields.
    if (parts[0] === 'admin' && parts[1] === 'service-content' && parts.length === 3 && method === 'PUT') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const slug = parts[2]
      const body = await readJson(request)
      const ALLOW = [
        'title', 'title_en', 'short_label', 'h1',
        'tagline', 'tagline_en',
        'description', 'description_en',
        'long_copy', 'long_copy_en',
        'meta_title', 'meta_title_en',
        'meta_description', 'meta_description_en',
        'image', 'image_alt', 'image_alt_en',
        'keypoints', 'keypoints_en',
        'related_services',
        'sections', 'faqs',
      ]
      const update = {}
      for (const k of ALLOW) if (k in body) update[k] = body[k]
      update.updated_at = new Date()
      const db = await getDb()
      const result = await db.collection('service_content').findOneAndUpdate(
        { slug },
        { $set: update },
        { returnDocument: 'after' }
      )
      if (!result) return j({ detail: 'Service not found' }, { status: 404 })
      // Bust the SSG cache for both locale variants and the list page.
      try {
        revalidatePath(`/services/${slug}`)
        revalidatePath(`/en/services/${slug}`)
        revalidatePath('/services')
        revalidatePath('/en/services')
        revalidatePath('/')
        revalidatePath('/sitemap.xml')
      } catch (e) { console.warn('[revalidate] failed', e?.message) }
      return j(cleanDoc(result))
    }

    // ---------- Settings (real collection is `site_settings`) ----------
    if (p === '/settings' && method === 'GET') {
      const db = await getDb()
      const doc = await db.collection('site_settings').findOne({})
      if (!doc) return j({ detail: 'Settings not found' }, { status: 404 })
      return j(cleanDoc(doc))
    }
    // PUT /api/settings \u2014 admin only.  Updates the singleton site_settings doc.
    if (p === '/settings' && method === 'PUT') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const body = await readJson(request)
      const ALLOW = [
        'business_name', 'tagline_de', 'tagline_en',
        'phone', 'email', 'whatsapp_number', 'recruitment_whatsapp_number',
        'hours_de', 'hours_en',
        'homepage_hero_image', 'escort_hamburg_image', 'about_image', 'social_share_image',
        'service_images', 'area_images',
        'facebook_url', 'instagram_url', 'twitter_url',
        'impressum_content', 'impressum_content_en',
        'diskretion_content',
        'about_content', 'about_content_en',
      ]
      const update = {}
      for (const k of ALLOW) if (k in body) update[k] = body[k]
      update.updated_at = new Date()
      const db = await getDb()
      // Update the (single) settings doc.  If none exists, upsert one.
      const result = await db.collection('site_settings').findOneAndUpdate(
        {},
        { $set: update, $setOnInsert: { _key: 'singleton', created_at: new Date() } },
        { upsert: true, returnDocument: 'after' }
      )
      // Header/footer/impressum/diskretion appear on every page — revalidate
      // the whole site including sitemap.
      try {
        revalidatePath('/', 'layout')
        revalidatePath('/en', 'layout')
        revalidatePath('/sitemap.xml')
      } catch (e) { console.warn('[revalidate] failed', e?.message) }
      return j(cleanDoc(result || (await db.collection('site_settings').findOne({}))))
    }

    // ---------- Service content ----------
    if (p === '/service-content' && method === 'GET') return j(await listServiceContent())
    if (parts[0] === 'service-content' && parts.length === 2 && method === 'GET') {
      const s = await getServiceContent(parts[1])
      if (!s) return j({ detail: 'Service content not found' }, { status: 404 })
      return j(s)
    }

    // ---------- Area content ----------
    if (p === '/area-content' && method === 'GET') return j(await listAreaContent())
    if (parts[0] === 'area-content' && parts.length === 2 && method === 'GET') {
      const a = await getAreaContent(parts[1])
      if (!a) return j({ detail: 'Area content not found' }, { status: 404 })
      return j(a)
    }
    // PUT /api/area-content/:slug \u2014 admin only.
    if (parts[0] === 'area-content' && parts.length === 2 && method === 'PUT') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const slug = parts[1]
      const body = await readJson(request)
      const ALLOW = [
        'title', 'title_en', 'name', 'name_en',
        'intro', 'intro_en',
        'description', 'description_en',
        'long_copy', 'long_copy_en',
        'meta_title', 'meta_title_en',
        'meta_description', 'meta_description_en',
        'image', 'image_alt', 'image_alt_en',
        'landmarks',
        'body_extra', 'body_extra_en',
        'faqs',
      ]
      const update = {}
      for (const k of ALLOW) if (k in body) update[k] = body[k]
      update.updated_at = new Date()
      const db = await getDb()
      const result = await db.collection('area_content').findOneAndUpdate(
        { slug },
        { $set: update },
        { returnDocument: 'after' }
      )
      if (!result) return j({ detail: 'Area not found' }, { status: 404 })
      try {
        revalidatePath(`/escort/${slug}`)
        revalidatePath(`/en/escort/${slug}`)
        revalidatePath('/areas')
        revalidatePath('/en/areas')
        revalidatePath('/sitemap.xml')
      } catch (e) { console.warn('[revalidate] failed', e?.message) }
      return j(cleanDoc(result))
    }

    // ---------- Models ----------
    if (p === '/models' && method === 'GET') {
      const { listPublicModels } = await import('@/lib/models')
      return j(await listPublicModels())
    }
    if (parts[0] === 'models' && parts.length === 2 && method === 'GET') {
      const { getPublicModel } = await import('@/lib/models')
      const doc = await getPublicModel(parts[1])
      if (!doc) return j({ detail: 'Model not found' }, { status: 404 })
      return j(doc)
    }

    // Admin \u2014 create model.
    if (p === '/models' && method === 'POST') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const body = await readJson(request)
      if (!body.slug || !body.name) {
        return j({ detail: 'slug and name are required' }, { status: 400 })
      }
      const slug = String(body.slug).toLowerCase().trim()
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return j({ detail: 'slug may only contain a-z, 0-9 and hyphens' }, { status: 400 })
      }
      const db = await getDb()
      const existing = await db.collection('models').findOne({ slug })
      if (existing) return j({ detail: 'A model with that slug already exists (including soft-deleted). Choose another slug.' }, { status: 409 })
      const ALLOW = MODEL_FIELDS
      const doc = { slug, id: crypto.randomUUID(), created_at: new Date(), updated_at: new Date() }
      for (const k of ALLOW) if (k in body) doc[k] = body[k]
      doc.available = doc.available ?? true
      doc.featured = doc.featured ?? false
      await db.collection('models').insertOne(doc)
      try {
        revalidatePath('/models')
        revalidatePath('/en/models')
        revalidatePath('/')
        revalidatePath('/sitemap.xml')
      } catch (e) { console.warn('[revalidate] failed', e?.message) }
      return j(cleanDoc(doc), { status: 201 })
    }

    // Admin \u2014 edit model.
    if (parts[0] === 'models' && parts.length === 2 && method === 'PUT') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const slug = parts[1]
      const body = await readJson(request)
      const ALLOW = MODEL_FIELDS
      const update = {}
      for (const k of ALLOW) if (k in body) update[k] = body[k]
      update.updated_at = new Date()
      const db = await getDb()
      const result = await db.collection('models').findOneAndUpdate(
        { slug },
        { $set: update },
        { returnDocument: 'after' }
      )
      if (!result) return j({ detail: 'Model not found' }, { status: 404 })
      try {
        revalidatePath(`/models/${slug}`)
        revalidatePath(`/en/models/${slug}`)
        revalidatePath('/models')
        revalidatePath('/en/models')
        revalidatePath('/')
        revalidatePath('/sitemap.xml')
      } catch (e) { console.warn('[revalidate] failed', e?.message) }
      return j(cleanDoc(result))
    }

    // Admin \u2014 soft delete.  Sets deleted_at, keeps the doc for recovery.
    if (parts[0] === 'models' && parts.length === 2 && method === 'DELETE') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const slug = parts[1]
      const db = await getDb()
      const result = await db.collection('models').findOneAndUpdate(
        { slug, deleted_at: { $in: [null, undefined] } },
        { $set: { deleted_at: new Date(), updated_at: new Date() } },
        { returnDocument: 'after' }
      )
      if (!result) return j({ detail: 'Model not found or already deleted' }, { status: 404 })
      try {
        revalidatePath(`/models/${slug}`)
        revalidatePath(`/en/models/${slug}`)
        revalidatePath('/models')
        revalidatePath('/en/models')
        revalidatePath('/')
        revalidatePath('/sitemap.xml')
      } catch (e) { console.warn('[revalidate] failed', e?.message) }
      return j({ ok: true, slug, deleted_at: result.deleted_at })
    }

    // ---------- Blog (real collection is `blog`) ----------
    if (p === '/blog' && method === 'GET') {
      const { listPublicBlog } = await import('@/lib/blog')
      return j(await listPublicBlog())
    }
    if (parts[0] === 'blog' && parts.length === 2 && method === 'GET') {
      const { getPublicBlog } = await import('@/lib/blog')
      const doc = await getPublicBlog(parts[1])
      if (!doc) return j({ detail: 'Blog post not found' }, { status: 404 })
      return j(doc)
    }

    // Admin \u2014 create.
    if (p === '/blog' && method === 'POST') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const body = await readJson(request)
      if (!body.slug || !body.title) return j({ detail: 'slug and title are required' }, { status: 400 })
      const slug = String(body.slug).toLowerCase().trim()
      if (!/^[a-z0-9-]+$/.test(slug)) return j({ detail: 'slug may only contain a-z, 0-9 and hyphens' }, { status: 400 })
      const db = await getDb()
      const existing = await db.collection('blog').findOne({ slug })
      if (existing) return j({ detail: 'A blog post with that slug already exists (including soft-deleted).' }, { status: 409 })
      const ALLOW = BLOG_FIELDS
      const doc = { slug, id: crypto.randomUUID(), created_at: new Date(), updated_at: new Date() }
      for (const k of ALLOW) if (k in body) doc[k] = body[k]
      doc.published = doc.published ?? false
      await db.collection('blog').insertOne(doc)
      try {
        revalidatePath('/blog'); revalidatePath('/en/blog')
        revalidatePath('/sitemap.xml')
      } catch (e) { console.warn('[revalidate] failed', e?.message) }
      return j(cleanDoc(doc), { status: 201 })
    }

    // Admin \u2014 edit.
    if (parts[0] === 'blog' && parts.length === 2 && method === 'PUT') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const slug = parts[1]
      const body = await readJson(request)
      const update = {}
      for (const k of BLOG_FIELDS) if (k in body) update[k] = body[k]
      update.updated_at = new Date()
      const db = await getDb()
      const result = await db.collection('blog').findOneAndUpdate({ slug }, { $set: update }, { returnDocument: 'after' })
      if (!result) return j({ detail: 'Blog post not found' }, { status: 404 })
      try {
        revalidatePath(`/blog/${slug}`); revalidatePath(`/en/blog/${slug}`)
        revalidatePath('/blog'); revalidatePath('/en/blog')
        revalidatePath('/sitemap.xml')
      } catch (e) { console.warn('[revalidate] failed', e?.message) }
      return j(cleanDoc(result))
    }

    // Admin \u2014 soft delete.
    if (parts[0] === 'blog' && parts.length === 2 && method === 'DELETE') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const slug = parts[1]
      const db = await getDb()
      const result = await db.collection('blog').findOneAndUpdate(
        { slug, deleted_at: { $in: [null, undefined] } },
        { $set: { deleted_at: new Date(), updated_at: new Date() } },
        { returnDocument: 'after' }
      )
      if (!result) return j({ detail: 'Blog post not found or already deleted' }, { status: 404 })
      try {
        revalidatePath(`/blog/${slug}`); revalidatePath(`/en/blog/${slug}`)
        revalidatePath('/blog'); revalidatePath('/en/blog')
        revalidatePath('/sitemap.xml')
      } catch (e) { console.warn('[revalidate] failed', e?.message) }
      return j({ ok: true, slug, deleted_at: result.deleted_at })
    }

    // ---------- Pages ----------
    if (p === '/pages' && method === 'GET') {
      const { listPublicPages } = await import('@/lib/pages')
      return j(await listPublicPages())
    }
    if (parts[0] === 'pages' && parts.length === 2 && method === 'GET') {
      const { getPublicPage } = await import('@/lib/pages')
      const doc = await getPublicPage(parts[1])
      if (!doc) return j({ detail: 'Page not found' }, { status: 404 })
      return j(doc)
    }

    // Admin \u2014 create.
    if (p === '/pages' && method === 'POST') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const body = await readJson(request)
      if (!body.slug || !body.title) return j({ detail: 'slug and title are required' }, { status: 400 })
      const slug = String(body.slug).toLowerCase().trim()
      if (!/^[a-z0-9-]+$/.test(slug)) return j({ detail: 'slug may only contain a-z, 0-9 and hyphens' }, { status: 400 })
      const db = await getDb()
      const existing = await db.collection('pages').findOne({ slug })
      if (existing) return j({ detail: 'A page with that slug already exists (including soft-deleted).' }, { status: 409 })
      const doc = { slug, id: crypto.randomUUID(), created_at: new Date(), updated_at: new Date() }
      for (const k of PAGE_FIELDS) if (k in body) doc[k] = body[k]
      doc.published = doc.published ?? false
      await db.collection('pages').insertOne(doc)
      try { revalidatePath(`/p/${slug}`); revalidatePath('/sitemap.xml') } catch {}
      return j(cleanDoc(doc), { status: 201 })
    }

    // Admin \u2014 edit.
    if (parts[0] === 'pages' && parts.length === 2 && method === 'PUT') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const slug = parts[1]
      const body = await readJson(request)
      const update = {}
      for (const k of PAGE_FIELDS) if (k in body) update[k] = body[k]
      update.updated_at = new Date()
      const db = await getDb()
      const result = await db.collection('pages').findOneAndUpdate({ slug }, { $set: update }, { returnDocument: 'after' })
      if (!result) return j({ detail: 'Page not found' }, { status: 404 })
      try { revalidatePath(`/p/${slug}`); revalidatePath('/sitemap.xml') } catch {}
      return j(cleanDoc(result))
    }

    // Admin \u2014 soft delete.
    if (parts[0] === 'pages' && parts.length === 2 && method === 'DELETE') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const slug = parts[1]
      const db = await getDb()
      const result = await db.collection('pages').findOneAndUpdate(
        { slug, deleted_at: { $in: [null, undefined] } },
        { $set: { deleted_at: new Date(), updated_at: new Date() } },
        { returnDocument: 'after' }
      )
      if (!result) return j({ detail: 'Page not found or already deleted' }, { status: 404 })
      try { revalidatePath(`/p/${slug}`); revalidatePath('/sitemap.xml') } catch {}
      return j({ ok: true, slug, deleted_at: result.deleted_at })
    }

    // ---------- Public contact form ----------
    // POST /api/contact — public endpoint used by the /kontakt form.
    // Writes a shape-compatible document to the same `contacts` collection
    // that the admin inbox reads. Honeypot silently absorbs bot traffic.
    if (p === '/contact' && method === 'POST') {
      const body = await readJson(request) || {}
      // Honeypot: hidden "website" field must remain empty. If populated,
      // we still return a 200 so bots don't retry, but skip the DB write.
      if (typeof body.website === 'string' && body.website.trim() !== '') {
        return j({ ok: true })
      }
      const name = (body.name || '').toString().trim()
      const email = (body.email || '').toString().trim()
      const message = (body.message || '').toString().trim()
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const errors = {}
      if (!name) errors.name = 'required'
      if (!email) errors.email = 'required'
      else if (!emailRe.test(email)) errors.email = 'invalid'
      if (!message) errors.message = 'required'
      else if (message.length < 20) errors.message = 'too_short'
      if (body.consent !== true && body.consent !== 'true') errors.consent = 'required'
      if (Object.keys(errors).length > 0) {
        return j({ detail: 'Validation failed', errors }, { status: 400 })
      }
      const doc = {
        id: crypto.randomUUID(),
        name,
        email,
        phone: (body.phone || '').toString().trim(),
        message,
        service: (body.service || '').toString().trim(),
        location: (body.location || '').toString().trim(),
        date: (body.date || '').toString().trim(),
        model_slug: (body.model_slug || '').toString().trim(),
        source_lang: body.lang === 'en' ? 'en' : 'de',
        // Admin inbox uses `read`/`archived`/`starred` booleans; keep the
        // legacy `status` field too so the 80 existing leads and new
        // submissions coexist in a single list without schema drift.
        read: false,
        archived: false,
        starred: false,
        status: 'new',
        created_at: new Date(),
        updated_at: new Date(),
      }
      const db = await getDb()
      await db.collection('contacts').insertOne(doc)
      return j({ ok: true, id: doc.id })
    }

    // ---------- Contacts (admin only) ----------
    if (p === '/contacts' && method === 'GET') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const url = new URL(request.url)
      const archived = url.searchParams.get('archived') === '1'
      const { listContacts } = await import('@/lib/contacts')
      return j(await listContacts({ archived }))
    }
    if (p === '/contacts/stats' && method === 'GET') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const { countUnread } = await import('@/lib/contacts')
      const db = await getDb()
      const [unread, total, archived, starred] = await Promise.all([
        countUnread(),
        db.collection('contacts').countDocuments({}),
        db.collection('contacts').countDocuments({ archived: true }),
        db.collection('contacts').countDocuments({ starred: true, archived: { $ne: true } }),
      ])
      return j({ unread, total, archived, starred })
    }
    if (parts[0] === 'contacts' && parts.length === 2 && method === 'GET') {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const { getContact } = await import('@/lib/contacts')
      const doc = await getContact(parts[1])
      if (!doc) return j({ detail: 'Contact not found' }, { status: 404 })
      return j(doc)
    }
    if (parts[0] === 'contacts' && parts.length === 2 && (method === 'PATCH' || method === 'PUT')) {
      const guard = await requireAdmin(request, NextResponse)
      if (!guard.ok) return cors(guard.response)
      const id = parts[1]
      const body = await readJson(request)
      const ALLOW = ['read', 'starred', 'archived', 'notes']
      const update = {}
      for (const k of ALLOW) if (k in body) update[k] = body[k]
      update.updated_at = new Date()
      const db = await getDb()
      const result = await db.collection('contacts').findOneAndUpdate(
        { id }, { $set: update }, { returnDocument: 'after' }
      )
      if (!result) return j({ detail: 'Contact not found' }, { status: 404 })
      return j(cleanDoc(result))
    }

    // ---------- Sitemap status ----------
    if (p === '/sitemap/status' && method === 'GET') {
      const svc = await listServiceContent()
      const areas = await listAreaContent()
      const db = await getDb()
      const [models, blog, pages] = await Promise.all([
        db.collection('models').countDocuments({ published: { $ne: false }, deleted_at: { $in: [null, undefined] } }),
        db.collection('blog').countDocuments({ published: { $ne: false }, deleted_at: { $in: [null, undefined] } }),
        db.collection('pages').countDocuments({ published: { $ne: false }, deleted_at: { $in: [null, undefined] } }),
      ])
      return j({ services: svc.length, areas: areas.length, models, blog, pages })
    }

    return j({ detail: `Not Found: ${method} ${p}` }, { status: 404 })
  } catch (e) {
    console.error('[api] error', e)
    return j({ detail: 'Internal error', error: String(e?.message || e) }, { status: 500 })
  }
}

export const GET = (req, ctx) => route(req, ctx, 'GET')
export const POST = (req, ctx) => route(req, ctx, 'POST')
export const PUT = (req, ctx) => route(req, ctx, 'PUT')
export const PATCH = (req, ctx) => route(req, ctx, 'PATCH')
export const DELETE = (req, ctx) => route(req, ctx, 'DELETE')
