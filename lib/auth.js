// Central auth helpers.  Cookie name = `access_token` (matches the reference
// FastAPI backend so any existing admin sessions and the CMS UI keep working).
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { getDb, cleanDoc } from '@/lib/mongo'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.warn('[auth] JWT_SECRET is not set')
}
const JWT_ALG = 'HS256'
const JWT_EXPIRES_IN = '7d'
export const AUTH_COOKIE = 'access_token'

export async function hashPassword(pw) {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(pw, salt)
}
export async function verifyPassword(pw, hash) {
  if (!hash) return false
  try { return await bcrypt.compare(pw, hash) } catch { return false }
}

export function signToken(user) {
  return jwt.sign(
    { sub: String(user.id || user._id || user.email), email: user.email, role: user.role || 'admin' },
    JWT_SECRET,
    { algorithm: JWT_ALG, expiresIn: JWT_EXPIRES_IN }
  )
}
export function verifyTokenString(token) {
  try { return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALG] }) } catch { return null }
}

// Cookie helpers \u2014 attach directly to a NextResponse object so route handlers
// can set the auth cookie on the same response they return.
export function attachAuthCookie(res, token, { maxAgeSeconds = 60 * 60 * 24 * 7 } = {}) {
  res.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  })
  return res
}
export function clearAuthCookie(res) {
  res.cookies.set({
    name: AUTH_COOKIE,
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}

// Read the current user from the request cookie.  Returns the user doc (minus
// password_hash) or null.  Works from both route handlers and server components
// (uses next/headers cookies()).
export async function getSessionUser(request) {
  let token = null
  try {
    if (request && request.cookies?.get) {
      token = request.cookies.get(AUTH_COOKIE)?.value || null
    }
  } catch { /* ignore */ }
  if (!token) {
    try {
      const store = await cookies()
      token = store.get(AUTH_COOKIE)?.value || null
    } catch { /* not inside a request context \u2014 ignore */ }
  }
  // Fallback: Authorization: Bearer header
  if (!token && request?.headers?.get) {
    const h = request.headers.get('authorization') || ''
    if (h.toLowerCase().startsWith('bearer ')) token = h.slice(7)
  }
  if (!token) return null

  const payload = verifyTokenString(token)
  if (!payload) return null

  const db = await getDb()
  // Users may have either `id` (UUID from FastAPI) or `_id` (ObjectId).
  // Try both.
  let user = null
  try { user = await db.collection('users').findOne({ id: payload.sub }) } catch {}
  if (!user) {
    try { user = await db.collection('users').findOne({ email: payload.email }) } catch {}
  }
  if (!user) return null
  const clean = cleanDoc(user)
  delete clean.password_hash
  return clean
}

// Guard for admin-only endpoints.  Returns { ok:true, user } or
// { ok:false, response } where response is a 401/403 NextResponse.
export async function requireAdmin(request, NextResponse) {
  const user = await getSessionUser(request)
  if (!user) {
    return { ok: false, response: NextResponse.json({ detail: 'Not authenticated' }, { status: 401 }) }
  }
  if (user.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ detail: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, user }
}
