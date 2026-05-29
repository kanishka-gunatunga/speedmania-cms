import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth/crypto.edge";

const COOKIE_NAME = "admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    // 1. Exclude /admin/login from blocking
    if (pathname === "/admin/login") {
      if (token) {
        const payload = await verifyToken(token);
        if (payload) {
          const [,, expiryStr] = payload.split(":");
          const expiry = parseInt(expiryStr, 10);
          if (Date.now() < expiry) {
            // Already logged in, redirect to dashboard
            return NextResponse.redirect(new URL("/admin", request.url));
          }
        }
      }
      return NextResponse.next();
    }

    // 2. Protect all other admin pages
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    const [,, expiryStr] = payload.split(":");
    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
