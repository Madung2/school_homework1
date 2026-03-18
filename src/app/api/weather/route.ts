import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAllowedEmail } from "@/lib/turso";
import { fetchUltraSrtNcst, fetchUltraSrtFcst } from "@/lib/weather";

export async function GET() {
  // 로컬 개발 시 인증 생략 ( .env.local 에 DEV_SKIP_AUTH=true 설정 시)
  if (process.env.DEV_SKIP_AUTH !== "true") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed = await isAllowedEmail(session.user.email);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const serviceKey = process.env.WEATHER_API_SERVICE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "날씨 API 인증키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const [realtime, forecast] = await Promise.all([
      fetchUltraSrtNcst(serviceKey),
      fetchUltraSrtFcst(serviceKey),
    ]);

    const realtimeList = Array.isArray(realtime) ? realtime : realtime ? [realtime] : [];
    const forecastList = Array.isArray(forecast) ? forecast : forecast ? [forecast] : [];

    return NextResponse.json({
      realtime: realtimeList,
      forecast: forecastList,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "날씨 정보를 불러올 수 없습니다.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
