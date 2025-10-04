// middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si el usuario no está autenticado y пытается acceder a una ruta protegida (ej: /dashboard)
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    // Redirigir a la página de inicio para que inicie sesión
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}
