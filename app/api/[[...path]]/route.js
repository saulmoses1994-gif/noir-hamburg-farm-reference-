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
        'title', 'short_label', 'h1',
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

    // ---------- Models ----------
    if (p === '/models' && method === 'GET') {
      const db = await getDb()
      const docs = await db.collection('models').find({ published: { $ne: false } }).sort({ created_at: -1 }).toArray()
      return j(docs.map(cleanDoc))
    }
    if (parts[0] === 'models' && parts.length === 2 && method === 'GET') {
      const db = await getDb()
      const doc = await db.collection('models').findOne({ slug: parts[1] })
      if (!doc) return j({ detail: 'Model not found' }, { status: 404 })
      return j(cleanDoc(doc))
    }

    // ---------- Blog (real collection is `blog`) ----------
    if (p === '/blog' && method === 'GET') {
      const db = await getDb()
      const docs = await db.collection('blog').find({ published: { $ne: false } }).sort({ created_at: -1 }).toArray()
      return j(docs.map(cleanDoc))
    }
    if (parts[0] === 'blog' && parts.length === 2 && method === 'GET') {
      const db = await getDb()
      const doc = await db.collection('blog').findOne({ slug: parts[1] })
      if (!doc) return j({ detail: 'Blog post not found' }, { status: 404 })
      return j(cleanDoc(doc))
    }

    // ---------- Pages ----------
    if (p === '/pages' && method === 'GET') {
      const db = await getDb()
      const docs = await db.collection('pages').find({ published: { $ne: false } }).toArray()
      return j(docs.map(cleanDoc))
    }
    if (parts[0] === 'pages' && parts.length === 2 && method === 'GET') {
      const db = await getDb()
      const doc = await db.collection('pages').findOne({ slug: parts[1] })
      if (!doc) return j({ detail: 'Page not found' }, { status: 404 })
      return j(cleanDoc(doc))
    }

    // ---------- Sitemap status ----------
    if (p === '/sitemap/status' && method === 'GET') {
      const svc = await listServiceContent()
      const areas = await listAreaContent()
      const db = await getDb()
      const [models, blog, pages] = await Promise.all([
        db.collection('models').countDocuments({ published: { $ne: false } }),
        db.collection('blog').countDocuments({ published: { $ne: false } }),
        db.collection('pages').countDocuments({ published: { $ne: false } }),
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
export const DELETE = (req, ctx) => route(req, ctx, 'DELETE')
