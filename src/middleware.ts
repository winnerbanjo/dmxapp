import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SESSION_COOKIES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "dmx-merchant-token",
  "dmx-hub-token",
];

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/merchant", "/customer", "/hub"];
const PUBLIC_PREFIXES = ["/auth", "/api", "/track", "/"];
const SIGNIN_URL = "/auth/login";

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function hasSessionCookie(request: NextRequest): boolean {
  const cookieHeader = request.cookies.toString();
  return SESSION_COOKIES.some((name) => cookieHeader.includes(`${name}=`));
}

function redirectToSignIn(request: NextRequest, pathname: string, reason?: string) {
  const loginUrl = new URL(SIGNIN_URL, request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  if (reason) {
    console.log("[middleware] Redirecting to signin:", reason);
  }
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    if (!isProtectedPath(pathname) || isPublicPath(pathname)) {
      return NextResponse.next();
    }

    if (!hasSessionCookie(request)) {
      return redirectToSignIn(request, pathname, "No session cookie");
    }

    // Role-check for /admin routes
    if (pathname.startsWith("/admin")) {
      let token;
      try {
        token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });
      } catch (err) {
        console.log("[middleware] Token decode failed, redirecting to signin. Error:", err);
        return redirectToSignIn(request, pathname, "Token decode failed");
      }

      const role = token?.role;
      if (token == null || role == null || role !== "ADMIN") {
        console.log("[middleware] Admin route: token =", JSON.stringify(token ?? null), "| role =", role);
        return redirectToSignIn(request, pathname, "Missing or invalid admin token/role");
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.log("[middleware] Unhandled error, redirecting to signin. Error:", err);
    return redirectToSignIn(request, pathname, "Middleware error");
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/merchant/:path*", "/customer/:path*", "/hub/:path*"],
};
