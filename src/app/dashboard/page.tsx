"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Station = {
  대여소명: string;
  관리번호: string;
  소재지주소: string;
  위도: number;
  경도: number;
  거치대수: number;
};

export default function DashboardPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stations")
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 403 ? "접근 권한이 없습니다." : "데이터를 불러올 수 없습니다.");
        return res.json();
      })
      .then(setStations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">따릉이 대여소 대시보드</h1>
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
        출처: 서울 열린데이터광장 공공자전거 따릉이 대여소 정보 (공공누리 1유형)
      </p>

      {loading && <p>로딩 중...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 font-medium">대여소명</th>
                <th className="p-3 font-medium">관리번호</th>
                <th className="p-3 font-medium">소재지주소</th>
                <th className="p-3 font-medium">위도</th>
                <th className="p-3 font-medium">경도</th>
                <th className="p-3 font-medium">거치대수</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s, i) => (
                <tr key={s.관리번호 || i} className="border-t dark:border-gray-700">
                  <td className="p-3">{s.대여소명}</td>
                  <td className="p-3">{s.관리번호}</td>
                  <td className="p-3">{s.소재지주소}</td>
                  <td className="p-3">{s.위도}</td>
                  <td className="p-3">{s.경도}</td>
                  <td className="p-3">{s.거치대수}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
