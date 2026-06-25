import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

/* Inter for Latin characters */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/* Noto Sans SC for Chinese characters */
const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "枫转 MapleZhuan — 加拿大华人本地闲置和转租市场",
  description:
    "不用加好友，不用刷群翻帖。闲置一眼看清，价格、状态、位置直接展示。安省华人本地二手交易和转租平台，优先覆盖滑铁卢、多伦多。",
};

import AppShell from "@/components/app/AppShell";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-Hans"
      className={`${inter.variable} ${notoSansSC.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col antialiased bg-[#f3fbf7]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
