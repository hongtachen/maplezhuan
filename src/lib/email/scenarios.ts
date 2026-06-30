import { EMAIL_GLOBAL_CONTENT } from "./scenario-content";
import { renderEmailScenario } from "./render";
import type { EmailContent } from "./types";

export type { EmailContent };

export function buildNewItemRequestEmail(params: {
  nickname: string;
  itemTitle: string;
  action: "request_buy" | "request_reserve";
  message: string;
  chatId?: string;
}): EmailContent {
  const actionLabel =
    params.action === "request_buy"
      ? EMAIL_GLOBAL_CONTENT.actionLabels.request_buy
      : EMAIL_GLOBAL_CONTENT.actionLabels.request_reserve;

  return renderEmailScenario(
    "new_item_request",
    {
      nickname: params.nickname,
      itemTitle: params.itemTitle,
      actionLabel,
      message: params.message,
    },
    { chatId: params.chatId },
  );
}

export function buildNewSubletRequestEmail(params: {
  nickname: string;
  title: string;
  message: string;
  chatId?: string;
}): EmailContent {
  return renderEmailScenario(
    "new_sublet_request",
    {
      nickname: params.nickname,
      itemTitle: params.title,
      actionLabel: EMAIL_GLOBAL_CONTENT.actionLabels.sublet_reserve,
      message: params.message,
    },
    { chatId: params.chatId },
  );
}

export function buildNewBargainEmail(params: {
  nickname: string;
  roleLabel: string;
  itemTitle: string;
  message: string;
  chatId?: string;
  itemType: "item" | "sublet";
}): EmailContent {
  const listingLabel =
    params.itemType === "sublet"
      ? EMAIL_GLOBAL_CONTENT.listingLabels.sublet
      : EMAIL_GLOBAL_CONTENT.listingLabels.item;

  return renderEmailScenario(
    "new_bargain",
    {
      nickname: params.nickname || params.roleLabel,
      itemTitle: params.itemTitle,
      listingLabel,
      actionLabel: EMAIL_GLOBAL_CONTENT.actionLabels.bargain,
      message: params.message,
    },
    { chatId: params.chatId },
  );
}

export function buildReserveAcceptedEmail(params: {
  nickname: string;
  itemTitle: string;
  chatId?: string;
}): EmailContent {
  return renderEmailScenario(
    "reserve_accepted",
    {
      nickname: params.nickname,
      itemTitle: params.itemTitle,
    },
    { chatId: params.chatId },
  );
}

export function buildTransactionCompletedEmail(params: {
  nickname: string;
  itemTitle: string;
  chatId?: string;
  includeFeedbackNote?: boolean;
}): EmailContent {
  return renderEmailScenario(
    "transaction_completed",
    {
      nickname: params.nickname,
      itemTitle: params.itemTitle,
      includeFeedbackNote: params.includeFeedbackNote !== false,
    },
    { chatId: params.chatId },
  );
}

export function buildRequestDeclinedEmail(params: {
  nickname: string;
  itemTitle: string;
  reason?: string;
  chatId?: string;
}): EmailContent {
  return renderEmailScenario(
    "request_declined",
    {
      nickname: params.nickname,
      itemTitle: params.itemTitle,
      reason: params.reason,
    },
    { chatId: params.chatId },
  );
}

export function buildBargainDeclinedEmail(params: {
  nickname: string;
  itemTitle: string;
  chatId?: string;
}): EmailContent {
  return renderEmailScenario(
    "bargain_declined",
    {
      nickname: params.nickname,
      itemTitle: params.itemTitle,
    },
    { chatId: params.chatId },
  );
}

export function buildTransactionCancelledEmail(params: {
  nickname: string;
  itemTitle: string;
  chatId?: string;
}): EmailContent {
  return renderEmailScenario(
    "transaction_cancelled",
    {
      nickname: params.nickname,
      itemTitle: params.itemTitle,
      statusLabel: "已取消",
    },
    { chatId: params.chatId },
  );
}

/** Dev preview — driven by scenario-content labels */
export const EMAIL_PREVIEW_SCENARIOS = [
  {
    id: "new-item-request-buy",
    label: `${EMAIL_GLOBAL_CONTENT.listingLabels.item} · 直接购买`,
    build: () =>
      buildNewItemRequestEmail({
        nickname: "小明",
        itemTitle: "IKEA 书桌",
        action: "request_buy",
        message: "你好，我想今天来看，方便吗？",
        chatId: "preview-chat-id",
      }),
  },
  {
    id: "new-item-request-reserve",
    label: `${EMAIL_GLOBAL_CONTENT.listingLabels.item} · 预留申请`,
    build: () =>
      buildNewItemRequestEmail({
        nickname: "小明",
        itemTitle: "MacBook Pro 14",
        action: "request_reserve",
        message: "可以帮我预留到周五吗？",
        chatId: "preview-chat-id",
      }),
  },
  {
    id: "new-sublet-request",
    label: "新预订申请（房东）",
    build: () =>
      buildNewSubletRequestEmail({
        nickname: "房东张",
        title: "DT 单间 in Condo",
        message: "9月1日入住，租期一年，可以吗？",
        chatId: "preview-chat-id",
      }),
  },
  {
    id: "new-bargain-item",
    label: "新议价（卖家）",
    build: () =>
      buildNewBargainEmail({
        nickname: "小明",
        roleLabel: "卖家",
        itemTitle: "宜家衣柜",
        message: "我出价 $80，可以自取。",
        chatId: "preview-chat-id",
        itemType: "item",
      }),
  },
  {
    id: "new-bargain-sublet",
    label: "新议价（房东）",
    build: () =>
      buildNewBargainEmail({
        nickname: "房东张",
        roleLabel: "房东",
        itemTitle: "UTSG 附近主卧",
        message: "月租能降到 $1200 吗？",
        chatId: "preview-chat-id",
        itemType: "sublet",
      }),
  },
  {
    id: "reserve-accepted",
    label: "预留通过（买家）",
    build: () =>
      buildReserveAcceptedEmail({
        nickname: "小红",
        itemTitle: "IKEA 书桌",
        chatId: "preview-chat-id",
      }),
  },
  {
    id: "transaction-completed",
    label: "交易完成（买家）",
    build: () =>
      buildTransactionCompletedEmail({
        nickname: "小红",
        itemTitle: "IKEA 书桌",
        chatId: "preview-chat-id",
      }),
  },
  {
    id: "request-declined",
    label: "申请被拒（买家）",
    build: () =>
      buildRequestDeclinedEmail({
        nickname: "小红",
        itemTitle: "IKEA 书桌",
        reason: "已有其他买家预留",
        chatId: "preview-chat-id",
      }),
  },
  {
    id: "bargain-declined",
    label: "议价被拒",
    build: () =>
      buildBargainDeclinedEmail({
        nickname: "小红",
        itemTitle: "宜家衣柜",
        chatId: "preview-chat-id",
      }),
  },
  {
    id: "transaction-cancelled",
    label: "交易取消（买家）",
    build: () =>
      buildTransactionCancelledEmail({
        nickname: "小红",
        itemTitle: "IKEA 书桌",
        chatId: "preview-chat-id",
      }),
  },
] as const;
