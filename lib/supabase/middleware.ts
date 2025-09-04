import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware - Processing request:", request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Use getUser() for more reliable server-side auth check
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  console.log("[v0] Middleware - Session state:", {
    hasSession: !!user,
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    pathname: request.nextUrl.pathname,
    error: error?.message,
  })

  // Check if path requires authentication
  const isAuthPath = request.nextUrl.pathname.startsWith("/auth") || request.nextUrl.pathname === "/"
  const requiresAuth = !isAuthPath

  if (requiresAuth && !user) {
    console.log("[v0] Middleware - Redirecting to login: no user found")
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Refresh session to keep it alive
  if (user) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      console.log("[v0] Middleware - Session refreshed for user:", user.email)
    }
  }

  console.log("[v0] Middleware - Auth check passed, continuing to:", request.nextUrl.pathname)
  return supabaseResponse
}
