import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">기상 대시보드</h1>
      <p className="text-gray-600 dark:text-gray-400">
        기상청 초단기실황·예보를 확인하려면 로그인해 주세요.
      </p>
      <Link
        href="/api/auth/signin/google?callbackUrl=%2Fdashboard"
        className="inline-flex items-center px-6 py-3 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Google로 로그인
      </Link>
    </main>
  );
}
