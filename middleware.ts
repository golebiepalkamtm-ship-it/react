import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/admin'] // Add your protected routes here

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('sb-access-token')?.value // Supabase typically uses 'sb-access-token'

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verify the token with Supabase
      const { data: { user }, error } = supabase.auth.getUser(token)
      
      if (error || !user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
