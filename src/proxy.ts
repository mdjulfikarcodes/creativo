import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  

  const privateRoutes = [
    "/dashboard",
    "/dashboard/add-studio",
    "/dashboard/my-bookings",
    "/dashboard/my-studio",
  ];

 
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

  matcher: [
    "/dashboard/:path*",
  ],
};