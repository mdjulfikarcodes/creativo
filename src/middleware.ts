import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const privateRoutes = ["/add-studio", "/my-listings", "/my-bookings", "/dashboard"];

  if (privateRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const token =
      request.cookies.get("token")?.value ||
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/add-studio/:path*", "/my-listings/:path*", "/my-bookings/:path*", "/dashboard/:path*"],
};
