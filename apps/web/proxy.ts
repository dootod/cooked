import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("better-auth.session_token");
    if (!token) {
      return NextResponse.redirect(new URL("/compte/connexion", request.url));
    }
    // TODO: verify admin role — for now gate on session existence
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
