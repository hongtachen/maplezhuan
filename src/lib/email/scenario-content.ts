/**
 * Email copy configuration — edit scenario subjects, body text, and CTA labels here.
 *
 * Placeholders: `{nickname}`, `{itemTitle}`, `{message}`, `{actionLabel}`, `{reason}`, etc.
 * Variables listed in `boldVars` render as bold in the HTML body.
 *
 * Backend-ready: this structure is JSON-serializable. A future admin panel can load
 * the same shape from Firestore and call `setEmailContentOverride()` in render.ts.
 */
import type { EmailContentConfig, EmailScenarioId } from "./types";

export const EMAIL_GLOBAL_CONTENT = {
  subjectPrefix: "【枫转】",
  actionLabels: {
    request_buy: "直接购买",
    request_reserve: "预留申请",
    sublet_reserve: "预订申请",
    bargain: "议价",
  },
  listingLabels: {
    item: "商品",
    sublet: "房源",
  },
  cta: {
    viewAndHandle: "查看并处理",
    viewChat: "查看对话",
    browseItems: "浏览商品",
  },
  defaultNicknames: {
    seller: "卖家",
    landlord: "房东",
    buyer: "买家",
    user: "用户",
  },
  footer: {
    contactTitle: "有问题吗？ 请由以下的邮件来联系我们，感谢，我们会尽快回复您",
    unsubscribePrompt: "不想再收到通知？",
    unsubscribeLink: "前往通知设置来管理您的通知",
    suspiciousEmail: "若非您本人未发布此商品或感觉有误，请忽略或",
    contactUs: "联系我们",
    autoSendNotice: "此邮件由枫转 MapleZhuan 自动发送，请勿直接回复。",
    brandName: "枫转 MapleZhuan",
  },
} as const;

export const EMAIL_SCENARIOS = {
  new_item_request: {
    id: "new_item_request",
    label: "新交易申请（卖家）",
    subject: '您的商品"{itemTitle}"有新的交易申请',
    paragraphs: [
      "有买家对您的商品{itemTitle}发起了{actionLabel}。",
      '买家留言："{message}"',
    ],
    boldVars: ["itemTitle", "actionLabel"],
    cta: { labelKey: "viewAndHandle", target: "messages_chat" },
    defaultNicknameKey: "seller",
  },
  new_sublet_request: {
    id: "new_sublet_request",
    label: "新预订申请（房东）",
    subject: '您的房源"{itemTitle}"有新的预订申请',
    paragraphs: [
      "有租客对您的房源{itemTitle}发起了{actionLabel}。",
      '租客留言："{message}"',
    ],
    boldVars: ["itemTitle", "actionLabel"],
    cta: { labelKey: "viewAndHandle", target: "messages_chat" },
    defaultNicknameKey: "landlord",
  },
  new_bargain: {
    id: "new_bargain",
    label: "新议价",
    subject: '您的{listingLabel}"{itemTitle}"有新的议价',
    paragraphs: [
      "有用户对您发布的{itemTitle}发起了{actionLabel}。",
      '留言："{message}"',
    ],
    boldVars: ["itemTitle", "actionLabel"],
    cta: { labelKey: "viewAndHandle", target: "messages_chat" },
    defaultNicknameKey: "seller",
  },
  reserve_accepted: {
    id: "reserve_accepted",
    label: "预留通过（买家）",
    subject: "您的预留申请已通过",
    paragraphs: [
      "卖家已同意{itemTitle}的预留申请。",
      "可登录枫转平台查看对话详情。",
    ],
    boldVars: ["itemTitle"],
    cta: { labelKey: "viewChat", target: "messages_chat" },
    defaultNicknameKey: "buyer",
  },
  transaction_completed: {
    id: "transaction_completed",
    label: "交易完成（买家）",
    subject: "交易已完成",
    paragraphs: [
      "卖家已确认{itemTitle}的交易完成。",
      {
        optional: "includeFeedbackNote",
        template: "如果您喜欢本次交易，请给卖家一个评价",
      },
      {
        optional: "includeFeedbackNote",
        template:
          "或者您有什么建议也可以告诉我们，这能帮助我们改进平台来给大家提供更好的服务，感谢",
      },
    ],
    boldVars: ["itemTitle"],
    cta: { labelKey: "viewChat", target: "messages_chat" },
    defaultNicknameKey: "buyer",
  },
  request_declined: {
    id: "request_declined",
    label: "申请被拒（买家）",
    subject: "您的申请未被接受",
    paragraphs: [
      "卖家未能接受您对{itemTitle}的申请。",
      { optional: "reason", template: "原因：{reason}" },
      "您可以在枫转继续浏览其他商品。",
    ],
    boldVars: ["itemTitle"],
    cta: { labelKey: "browseItems", target: "home" },
    defaultNicknameKey: "buyer",
  },
  bargain_declined: {
    id: "bargain_declined",
    label: "议价被拒",
    subject: "议价未被接受",
    paragraphs: [
      "对方未能接受您对{itemTitle}的议价。",
      "您可以在枫转继续沟通或浏览其他信息。",
    ],
    boldVars: ["itemTitle"],
    cta: { labelKey: "viewChat", target: "messages_chat" },
    defaultNicknameKey: "user",
  },
  transaction_cancelled: {
    id: "transaction_cancelled",
    label: "交易取消（买家）",
    subject: "交易已取消 — {itemTitle}",
    paragraphs: [
      "卖家已将{itemTitle}重新上架，您之前的成交记录已标记为{statusLabel}。",
      "如有疑问，可通过站内私信联系卖家。",
    ],
    boldVars: ["itemTitle", "statusLabel"],
    cta: { labelKey: "viewChat", target: "messages_chat" },
    defaultNicknameKey: "buyer",
  },
} as const satisfies EmailContentConfig["scenarios"];

/** Default config — used by renderer; admin can override at runtime */
export function getDefaultEmailContentConfig(): EmailContentConfig {
  return {
    global: EMAIL_GLOBAL_CONTENT,
    scenarios: EMAIL_SCENARIOS as EmailContentConfig["scenarios"],
  };
}

export type { EmailScenarioId };
