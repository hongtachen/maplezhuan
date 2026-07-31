import type { Metadata } from "next";
import LegalDocLayout from "@/components/legal/LegalDocLayout";
import { privacyDoc } from "@/content/legal";

export const metadata: Metadata = {
  title: "隐私政策 — 枫转 MapleZhuan",
  description: "枫转 MapleZhuan 如何收集、使用与保护您的个人信息。",
};

export default function PrivacyPage() {
  return <LegalDocLayout doc={privacyDoc} />;
}
