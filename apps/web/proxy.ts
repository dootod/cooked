import { type NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("better-auth.session_token");
    if (!token) {
      return NextResponse.redirect(new URL("/compte/connexion", request.url));
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: { cookie: `better-auth.session_token=${token.value}` },
      });
      if (!res.ok) {
        return NextResponse.redirect(
          new URL("/compte/connexion", request.url),
        );
      }
      const data = await res.json();
      if (data?.user?.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/compte/connexion", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
