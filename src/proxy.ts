import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── Static asset passthrough ───────────────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$/.test(pathname)
  ) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ─── Session check ───────────────────────────────────────────────────────────
  // Must use getUser() (not getSession()) for security — validates token server-side
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // If Supabase is unreachable, fail open (don't redirect in a loop)
    return supabaseResponse
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isProtectedPage = ['/dashboard', '/ncp', '/assistant', '/drugs', '/revision', '/profile', '/videos'].some(
    path => pathname.startsWith(path)
  )

  // ─── Unauthenticated user → redirect to login (only for protected pages) ────
  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname) // preserve intended destination
    return NextResponse.redirect(url)
  }

  // ─── Authenticated user → redirect away from auth pages ─────────────────────
  // IMPORTANT: Only redirect if user is confirmed (not just "exists")
  // Do NOT redirect to /dashboard here — dashboard handles its own state.
  // Instead redirect to landing page or dashboard based on intent.
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
