import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Evitar redirección a /es u otros locales no deseados
  if (pathname.startsWith('/es') || pathname.startsWith('/en') || pathname.startsWith('/ca')) {
    // Extraer la ruta sin el prefijo de idioma
    const pathWithoutLocale = pathname.replace(/^\/(es|en|ca)/, '') || '/'
    const url = request.nextUrl.clone()
    url.pathname = pathWithoutLocale
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Matcher para aplicar el middleware solo a rutas específicas
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - videos (public videos)
     * - uploads (uploads)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|videos|uploads).*)',
  ],
}
