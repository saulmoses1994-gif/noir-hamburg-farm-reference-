import { NextResponse } from 'next/server'

export function middleware(request) {
  const headers = new Headers(request.headers)
  headers.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
