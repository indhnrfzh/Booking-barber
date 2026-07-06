import createMiddleware from 'next-intl/middleware'
import { routing } from './lib/navigation'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  // Skip i18n middleware for /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(id|en)/:path*', '/admin/:path*'],
}
