import type { Metadata } from "next";
import LegalDocLayout from "@/components/legal/LegalDocLayout";
import { LEGAL_NAV_ITEMS, legalIndexDoc } from "@/content/legal";

export const metadata: Metadata = {
  title: "法律信息 — 枫转 MapleZhuan",
  description: "枫转 MapleZhuan 隐私政策、服务条款、Cookie 说明与社区规范。",
};

export default function LegalIndexPage() {
  return (
    <LegalDocLayout doc={legalIndexDoc} navItems={LEGAL_NAV_ITEMS} isIndex />
  );
}
