import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/dashboard']
const adminRoutes     = ['/admin']
const publicRoutes    = ['/login', '/']

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  const isProtected  = protectedRoutes.some(r => path.startsWith(r))
  const isAdminRoute = adminRoutes.some(r => path.startsWith(r))
  const isPublic     = publicRoutes.includes(path)

  const token   = req.cookies.get('sabifin-session')?.value
  const session = await decrypt(token)

  // Sin sesión → login
  if ((isProtected || isAdminRoute) && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Ruta de admin pero no es admin → dashboard
  if (isAdminRoute && session?.userId && !session.isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  // Ya logueado y va a ruta pública → redirigir según rol
  if (isPublic && session?.userId) {
    const dest = session.isAdmin ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(dest, req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
