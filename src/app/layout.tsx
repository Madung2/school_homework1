import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "따릉이 대여소 대시보드",
  description: "서울시 공공자전거 따릉이 대여소 정보 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
