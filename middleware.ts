import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function hasSessionCookie(req: NextRequest): boolean {
  const sessionCookie =
    req.cookies.get('__Secure-authjs.session-token') ||
    req.cookies.get('authjs.session-token') ||
    req.cookies.get('next-auth.session-token') ||
    req.cookies.get('__Secure-next-auth.session-token')
  return !!sessionCookie
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname.startsWith('/login')
  const isApiAuthRoute = pathname.startsWith('/api/auth')
  const isPublicAsset = pathname.startsWith('/_next') || pathname.includes('.')
  const isPublicApi = pathname.startsWith('/api/health')

  if (isApiAuthRoute || isPublicApi || isPublicAsset) {
    return NextResponse.next()
  }

  const isLoggedIn = hasSessionCookie(request)

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
