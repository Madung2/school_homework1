"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GuestbookEntry = {
  id: number;
  author: string;
  content: string;
  created_at: string;
};

function formatDate(iso: string) {
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
}

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    const a = author.trim();
    const c = content.trim();
    if (!a || !c) {
      setSubmitError("닉네임과 댓글을 모두 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: a, content: c }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "등록에 실패했습니다.");
        setAuthor("");
        setContent("");
        fetchEntries();
      })
      .catch((e) => setSubmitError(e.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">방명록</h1>
        <Link
          href="/"
          className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          홈
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="mb-3">
          <label htmlFor="guestbook-author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            닉네임 (아이디)
          </label>
          <input
            id="guestbook-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="아무 아이디나 입력"
            maxLength={50}
            className="w-full px-3 py-2 border rounded dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            disabled={submitting}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="guestbook-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
        {submitError && <p className="text-red-600 dark:text-red-400 text-sm mb-2">{submitError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </form>

      <section>
        <h2 className="text-lg font-semibold mb-3">방명록 목록</h2>
        {loading && <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
        {!loading && !error && entries.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">아직 남긴 글이 없습니다.</p>
        )}
        {!loading && !error && entries.length > 0 && (
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800/50"
              >
                <div className="flex justify-between items-baseline gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{entry.author}</span>
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
    </main>
  );
}
