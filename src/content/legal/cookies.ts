import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_ENTITY_NAME,
  LEGAL_LAST_UPDATED,
  SITE_URL,
} from "@/lib/constants";
import type { LegalDoc } from "./types";

export const cookiesDoc: LegalDoc = {
  title: "Cookie 与本地存储",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `${LEGAL_ENTITY_NAME} 运营的枫转（${SITE_URL}）使用 Cookie 与浏览器本地存储，来维护登录状态与基础功能正常工作。个人信息的完整说明见《隐私政策》。`,
  sections: [
    {
      title: "我们用到什么",
      paragraphs: [
        "我们使用 Cookie、浏览器本地存储及类似技术，以提供和维护平台功能，例如保持登录状态、保存用户偏好设置以及改善用户体验。",
      ],
      bullets: [],
    },
    {
      title: "我们不用什么",
      paragraphs: [
        "当前未使用广告追踪 Cookie，也未接入第三方访问分析工具。若日后启用，会更新本页。",
      ],
    },
    {
      title: "您的选择",
      paragraphs: [
        `可在浏览器中清除 Cookie 或本地存储；清除后可能需要重新登录，未登录收藏等本地数据也可能丢失。疑问请联系 ${LEGAL_CONTACT_EMAIL}。`,
      ],
    },
  ],
};
