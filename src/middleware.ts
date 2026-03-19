import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/auth")) return NextResponse.next();
  if (path.startsWith("/api/weather") || path.startsWith("/api/check-allowed")) {
    return NextResponse.next();
  }
  // 로컬 개발 시 인증 생략 ( .env.local 에 DEV_SKIP_AUTH=true 설정 시)
  if (process.env.DEV_SKIP_AUTH === "true") {
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
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/api/weather"],
};
