import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect old dashboard to new admin panel
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Check authentication for protected routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/aula-virtual/admin')) {
    // Get token from cookie or header
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token && !pathname.includes('/login')) {
      // Redirect to login if no token
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/aula-virtual/admin/:path*'
  ]
}