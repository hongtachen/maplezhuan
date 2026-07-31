import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_ENTITY_NAME,
  LEGAL_JURISDICTION,
  LEGAL_LAST_UPDATED,
  SITE_URL,
} from "@/lib/constants";
import type { LegalDoc, LegalNavItem } from "./types";

export const LEGAL_NAV_ITEMS: LegalNavItem[] = [
  {
    href: "/legal/privacy",
    title: "隐私政策",
    description: "我们收集哪些信息、如何使用，以及如何联系我们。",
  },
  {
    href: "/legal/terms",
    title: "服务条款",
    description: "使用平台的规则、交易责任与适用法律。",
  },
  {
    href: "/legal/cookies",
    title: "Cookie 与本地存储",
    description: "登录状态、本地偏好与 Firebase 相关技术说明。",
  },
  {
    href: "/legal/community",
    title: "社区与发布规范",
    description: "发布、聊天与交易时需遵守的行为准则。",
  },
];

export const legalIndexDoc: LegalDoc = {
  title: "法律信息",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `枫转 MapleZhuan（${SITE_URL}）由 ${LEGAL_ENTITY_NAME} 运营，提供加拿大本地闲置与转租信息发布、浏览与沟通服务。适用法律：${LEGAL_JURISDICTION}。联系：${LEGAL_CONTACT_EMAIL}。`,
  sections: [],
};

export { privacyDoc } from "./privacy";
export { termsDoc } from "./terms";
export { cookiesDoc } from "./cookies";
export { communityDoc } from "./community";
