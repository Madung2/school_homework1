import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const skipAuth = process.env.DEV_SKIP_AUTH === "true";
  const session = await getServerSession(authOptions);
  const { error } = await searchParams;
  if (!skipAuth && session?.user?.email) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">기상청 초단기실황·예보 대시보드</h1>
      {error === "AccessDenied" && (
        <p className="text-red-600 dark:text-red-400 mb-4">
          접근 권한이 없습니다. 허용된 계정만 이용할 수 있습니다.
        </p>
      )}
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
        {skipAuth
          ? "개발 모드: 인증 없이 대시보드를 사용할 수 있습니다."
          : "접근하려면 로그인 후 허용된 계정으로만 이용할 수 있습니다."}
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/guestbook"
          className="px-4 py-2 border border-gray-600 dark:border-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          방명록
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          대시보드
        </Link>
        {!skipAuth && (
          <Link
            href="/api/auth/signin/google"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Google로 로그인
          </Link>
        )}
      </div>
    </main>
  );
}
