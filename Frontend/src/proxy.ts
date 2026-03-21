import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_COOKIE = "coffee_auth_meta"

const protectedPrefix = ["/admin", "/employee"]
const adminPrefix = ["/admin"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const needsAuth = protectedPrefix.some((prefix) => pathname.startsWith(prefix))
  if (!needsAuth) {
    return NextResponse.next()
  }

  const roleCode = request.cookies.get(AUTH_COOKIE)?.value
  if (!roleCode) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(signInUrl)
  }

  const needsAdmin = adminPrefix.some((prefix) => pathname.startsWith(prefix))
  if (needsAdmin && roleCode !== "ADMIN") {
    return NextResponse.redirect(new URL("/forbidden", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*"],
}
