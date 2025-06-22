import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get user agent
  const userAgent = request.headers.get('user-agent') || ''
  
  // Simple mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  // Only redirect on root path
  if (request.nextUrl.pathname === '/') {
    if (isMobile) {
      return NextResponse.redirect(new URL('/mobile', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/'
}