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
      const signInUrl = new URL("/api/auth/signin/google", request.url);
      signInUrl.searchParams.set("callbackUrl", "/dashboard");
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/api/weather"],
};
