import { type NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const isProd = process.env.NODE_ENV === "production";

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob: ${API_URL} https://*.r2.cloudflarestorage.com https://images.unsplash.com`,
    `connect-src 'self' ${API_URL}`,
    "frame-src https://www.youtube.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

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
      return NextResponse.redirect(new URL("/compte/connexion", request.url));
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (isProd) {
    response.headers.set("Content-Security-Policy", buildCsp(nonce));
  } else {
    response.headers.set(
      "Content-Security-Policy-Report-Only",
      buildCsp(nonce),
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
