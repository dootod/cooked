import { type NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const secureCookie = request.cookies.get(
      "__Secure-better-auth.session_token",
    );
    const regularCookie = request.cookies.get("better-auth.session_token");
    const token = secureCookie ?? regularCookie;
    if (!token) {
      return NextResponse.redirect(new URL("/compte/connexion", request.url));
    }

    const cookieName = secureCookie
      ? "__Secure-better-auth.session_token"
      : "better-auth.session_token";

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: { cookie: `${cookieName}=${token.value}` },
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeout);
      if (!res.ok) {
        return NextResponse.redirect(new URL("/compte/connexion", request.url));
      }
      const data = await res.json();
      if (data?.user?.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // Network error or timeout — let through, client-side layout handles auth
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
