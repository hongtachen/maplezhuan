import type { Metadata } from "next";
import LegalDocLayout from "@/components/legal/LegalDocLayout";
import { cookiesDoc } from "@/content/legal";

export const metadata: Metadata = {
  title: "Cookie 与本地存储 — 枫转 MapleZhuan",
  description: "枫转 MapleZhuan 的 Cookie、本地存储与第三方技术说明。",
};

export default function CookiesPage() {
  return <LegalDocLayout doc={cookiesDoc} />;
}
