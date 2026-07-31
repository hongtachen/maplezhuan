import type { Metadata } from "next";
import LegalDocLayout from "@/components/legal/LegalDocLayout";
import { communityDoc } from "@/content/legal";

export const metadata: Metadata = {
  title: "社区与发布规范 — 枫转 MapleZhuan",
  description: "枫转 MapleZhuan 闲置与转租发布、聊天与交易行为准则。",
};

export default function CommunityPage() {
  return <LegalDocLayout doc={communityDoc} />;
}
