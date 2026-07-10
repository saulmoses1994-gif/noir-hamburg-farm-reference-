import { NextResponse } from 'next/server'
import { getDb, ensureSeeded, cleanDoc } from '@/lib/mongo'
import { listServiceContent, getServiceContent, listAreaContent, getAreaContent } from '@/lib/service-content'

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}
function j(data, init = {}) { return cors(NextResponse.json(data, init)) }

export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

// Route each request based on the catch-all path segments.  Endpoint paths
// mirror the FastAPI backend 1:1 (see MIGRATION_CHECKLIST §5).
async function route(request, ctx, method) {
  const params = await ctx.params
  const parts = params?.path || []
  const p = '/' + parts.join('/')

  try {
    if (method === 'GET' && p === '/' || p === '/health' && method === 'GET') {
      return j({ status: 'ok', service: 'noir-hamburg-nextjs', time: new Date().toISOString() })
    }
    if (method === 'GET' && p === '/health') {
      return j({ status: 'ok', time: new Date().toISOString() })
    }

    // Settings
    if (p === '/settings' && method === 'GET') {
      await ensureSeeded()
      const db = await getDb()
      let doc = await db.collection('settings').findOne({ _key: 'global' })
      if (!doc) {
        doc = {
          _key: 'global',
          site_name: 'Noir Hamburg',
          tagline_de: 'Premium Begleitagentur · Hamburg',
          tagline_en: 'Premium Companion Agency · Hamburg',
          phone: '+49 40 0000 0000',
          whatsapp: '+4940000000000',
          whatsappUrl: 'https://wa.me/4940000000000',
          email: 'kontakt@noir-hamburg.de',
          hours_de: 'Mo – Fr · 10 – 22 Uhr  ·  Sa, So, Feiertag · 13 – 22 Uhr',
          hours_en: 'Mon – Fri · 10 am – 10 pm  ·  Sat, Sun, Holidays · 1 pm – 10 pm',
        }
        await db.collection('settings').insertOne(doc)
      }
      return j(cleanDoc({ ...doc, _key: undefined }))
    }

    // Service content
    if (p === '/service-content' && method === 'GET') {
      return j(await listServiceContent())
    }
    if (parts[0] === 'service-content' && parts.length === 2 && method === 'GET') {
      const s = await getServiceContent(parts[1])
      if (!s) return j({ detail: 'Service content not found' }, { status: 404 })
      return j(s)
    }

    // Area content
    if (p === '/area-content' && method === 'GET') {
      return j(await listAreaContent())
    }
    if (parts[0] === 'area-content' && parts.length === 2 && method === 'GET') {
      const a = await getAreaContent(parts[1])
      if (!a) return j({ detail: 'Area content not found' }, { status: 404 })
      return j(a)
    }

    // Models (empty until CMS content is attached / seeded)
    if (p === '/models' && method === 'GET') {
      const db = await getDb()
      const docs = await db.collection('models').find({ published: { $ne: false } }).toArray()
      return j(docs.map(cleanDoc))
    }
    if (parts[0] === 'models' && parts.length === 2 && method === 'GET') {
      const db = await getDb()
      const doc = await db.collection('models').findOne({ slug: parts[1] })
      if (!doc) return j({ detail: 'Model not found' }, { status: 404 })
      return j(cleanDoc(doc))
    }

    // Blog (empty until content attached)
    if (p === '/blog' && method === 'GET') {
      const db = await getDb()
      const docs = await db.collection('blog_posts').find({ published: { $ne: false } }).toArray()
      return j(docs.map(cleanDoc))
    }
    if (parts[0] === 'blog' && parts.length === 2 && method === 'GET') {
      const db = await getDb()
      const doc = await db.collection('blog_posts').findOne({ slug: parts[1] })
      if (!doc) return j({ detail: 'Blog post not found' }, { status: 404 })
      return j(cleanDoc(doc))
    }

    // Pages
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

    // Sitemap status (health check)
    if (p === '/sitemap/status' && method === 'GET') {
      const svc = await listServiceContent()
      const areas = await listAreaContent()
      return j({ services: svc.length, areas: areas.length })
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
