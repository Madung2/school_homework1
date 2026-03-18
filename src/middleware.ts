import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAllowedEmail } from "@/lib/turso";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/auth")) return NextResponse.next();
  if (path.startsWith("/api/weather") || path.startsWith("/api/check-allowed")) {
    return NextResponse.next();
  }
  if (path === "/" || path === "/dashboard") {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      if (path === "/dashboard") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }
    if (path === "/dashboard") {
      const allowed = await isAllowedEmail(token.email);
      if (!allowed) {
        return NextResponse.redirect(new URL("/?error=AccessDenied", request.url));
      }
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/api/weather"],
};
