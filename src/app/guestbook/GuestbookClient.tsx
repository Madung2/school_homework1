"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GuestbookEntry = {
  id: number;
  author: string;
  content: string;
  created_at: string;
};

export default function GuestbookClient({
  authorEmail,
}: {
  authorEmail: string | null;
}) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formatDate = (iso: string) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const fetchEntries = () => {
    fetch("/api/guestbook")
      .then((res) => {
        if (!res.ok) throw new Error("방명록을 불러올 수 없습니다.");
        return res.json();
      })
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const c = content.trim();
    if (!c) {
      setSubmitError("댓글 내용을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: c }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "등록에 실패했습니다.");
        setContent("");
        fetchEntries();
      })
      .catch((e) => setSubmitError(e.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <main className="min-h-screen flex">
      <aside className="w-56 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-4">
        <div>
          <h1 className="text-base font-bold mb-1">기상 대시보드</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            기상청 초단기실황·예보
          </p>
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          <Link
            href="/dashboard"
            className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            대시보드
          </Link>
          <Link
            href="/guestbook"
            className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 font-medium"
          >
            방명록
          </Link>
        </nav>
        <div className="mt-auto">
          <Link
            href="/api/auth/signout?callbackUrl=%2Fapi%2Fauth%2Fsignin%2Fgoogle"
            className="inline-flex items-center px-3 py-1.5 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            로그아웃
          </Link>
        </div>
      </aside>
      <section className="flex-1 p-6 max-w-3xl">
        <h2 className="text-xl font-bold mb-4">방명록</h2>

        {!authorEmail ? (
          <div className="mb-8 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              로그인 후 방명록을 작성할 수 있습니다.
            </p>
            <div className="mt-3">
              <Link
                href="/api/auth/signin/google?callbackUrl=%2Fguestbook"
                className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Google로 로그인
              </Link>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              작성자: {authorEmail}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label
                  htmlFor="guestbook-content"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  댓글
                </label>
                <textarea
                  id="guestbook-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="방명록에 남길 말을 적어 주세요"
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border rounded dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-y"
                  disabled={submitting}
                />
              </div>
              {submitError && (
                <p className="text-red-600 dark:text-red-400 text-sm mb-2">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "등록 중..." : "등록"}
              </button>
            </form>
          </div>
        )}

        <section>
          <h3 className="text-lg font-semibold mb-3">방명록 목록</h3>
          {loading && (
            <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
          )}
          {error && (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          )}
          {!loading && !error && entries.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              아직 남긴 글이 없습니다.
            </p>
          )}
          {!loading && !error && entries.length > 0 && (
            <ul className="space-y-4">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800/50"
                >
                  <div className="flex justify-between items-baseline gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {entry.author}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {entry.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

