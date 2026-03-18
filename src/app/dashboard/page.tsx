"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RealtimeItem = {
  baseDate?: string;
  baseTime?: string;
  category?: string;
  obsrValue?: string;
  nx?: number;
  ny?: number;
};

type ForecastItem = {
  baseDate?: string;
  baseTime?: string;
  category?: string;
  fcstDate?: string;
  fcstTime?: string;
  fcstValue?: string;
  nx?: number;
  ny?: number;
};

const CATEGORY_LABEL: Record<string, string> = {
  T1H: "기온(°C)",
  RN1: "1시간 강수량(mm)",
  UUU: "동서 바람성분(m/s)",
  VVV: "남북 바람성분(m/s)",
  WSD: "풍속(m/s)",
  REH: "습도(%)",
  PTY: "강수형태",
  SKY: "하늘상태",
};

const SKY_LABEL: Record<string, string> = {
  "1": "맑음",
  "3": "흐림",
  "4": "매우 흐림",
};

const PTY_LABEL: Record<string, string> = {
  "0": "없음",
  "1": "비",
  "2": "비/눈",
  "3": "눈",
  "5": "빗방울",
  "6": "빗방울·눈날림",
  "7": "눈날림",
};

function formatTime(t?: string) {
  if (!t || t.length < 4) return t ?? "-";
  return `${t.slice(0, 2)}:${t.slice(2)}`;
}

export default function DashboardPage() {
  const [realtime, setRealtime] = useState<RealtimeItem[]>([]);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => {
        if (!res.ok)
          throw new Error(res.status === 403 ? "접근 권한이 없습니다." : "데이터를 불러올 수 없습니다.");
        return res.json();
      })
      .then((data) => {
        setRealtime(data.realtime ?? []);
        setForecast(data.forecast ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const realtimeByCategory = realtime.reduce<Record<string, string>>((acc, r) => {
    const cat = r.category ?? "";
    if (cat) acc[cat] = r.obsrValue ?? "";
    return acc;
  }, {});

  const forecastByTime = forecast.reduce<Record<string, Record<string, string>>((acc, f) => {
    const key = `${f.fcstDate ?? ""}-${f.fcstTime ?? ""}`;
    if (!key || key === "-") return acc;
    if (!acc[key]) acc[key] = {};
    const cat = f.category ?? "";
    if (cat) acc[key][cat] = f.fcstValue ?? "";
    return acc;
  }, {});
  const forecastTimes = Object.keys(forecastByTime).sort();

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">기상청 초단기실황·예보 대시보드</h1>
        <div className="flex gap-2">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            홈
          </Link>
          <Link
            href="/api/auth/signout"
            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            로그아웃
          </Link>
        </div>
      </header>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        출처: 기상청_단기예보(구 동네예보) 조회서비스, 공공데이터포털
      </p>

      {loading && <p>로딩 중...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && (
        <>
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">초단기실황</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              발표: {realtime[0]?.baseDate ?? "-"} {formatTime(realtime[0]?.baseTime)}
            </p>
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="p-3 font-medium">항목</th>
                    <th className="p-3 font-medium">값</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(realtimeByCategory).map(([cat, value]) => (
                    <tr key={cat} className="border-t dark:border-gray-700">
                      <td className="p-3">{CATEGORY_LABEL[cat] ?? cat}</td>
                      <td className="p-3">
                        {cat === "PTY" ? PTY_LABEL[value] ?? value : value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">초단기예보</h2>
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="p-3 font-medium">예보시각</th>
                    <th className="p-3 font-medium">기온(°C)</th>
                    <th className="p-3 font-medium">하늘</th>
                    <th className="p-3 font-medium">강수형태</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastTimes.map((key) => {
                    const [date, time] = key.split("-");
                    const row = forecastByTime[key];
                    const t1h = row?.T1H ?? "-";
                    const sky = row?.SKY != null ? SKY_LABEL[row.SKY] ?? row.SKY : "-";
                    const pty = row?.PTY != null ? PTY_LABEL[row.PTY] ?? row.PTY : "-";
                    return (
                      <tr key={key} className="border-t dark:border-gray-700">
                        <td className="p-3">
                          {date} {formatTime(time)}
                        </td>
                        <td className="p-3">{t1h}</td>
                        <td className="p-3">{sky}</td>
                        <td className="p-3">{pty}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
