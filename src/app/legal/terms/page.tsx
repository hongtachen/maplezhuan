import type { Metadata } from "next";
import LegalDocLayout from "@/components/legal/LegalDocLayout";
import { termsDoc } from "@/content/legal";

export const metadata: Metadata = {
  title: "服务条款 — 枫转 MapleZhuan",
  description: "使用枫转 MapleZhuan 平台的服务条款与责任说明。",
};

export default function TermsPage() {
  return <LegalDocLayout doc={termsDoc} />;
}
