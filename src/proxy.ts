import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const privateRoutes = [
    "/dashboard",
    "/dashboard/add-studio",
    "/dashboard/my-bookings",
    "/dashboard/my-studio",
    "/dashboard/studios/edit",
  ];

  if (privateRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_AUTH_URL || request.nextUrl.origin;
      
      const res = await fetch(`${baseUrl}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Unauthorized");
      }

      const session = await res.json();
      if (!session || !session.user) {
        throw new Error("No active session");
      }

    } catch (error) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};