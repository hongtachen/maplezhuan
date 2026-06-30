export type TransactionRequestType = "request_buy" | "request_reserve";

export const DEFAULT_REQUEST_MESSAGES = {
  item: {
    contact: "我对这件商品感兴趣",
    request_buy: "您好！我想直接购买这件商品，请确认！",
    request_reserve: "您好！我想申请预留这件商品，请问可以吗？",
  },
  sublet: {
    contact: "我对这个转租感兴趣",
    request_reserve: "您好！我想申请预留这件转租，请问可以吗？",
  },
} as const;

export function getDefaultRequestMessage(
  listingType: "item" | "sublet",
  action: TransactionRequestType,
): string {
  if (listingType === "sublet") {
    return DEFAULT_REQUEST_MESSAGES.sublet.request_reserve;
  }
  return DEFAULT_REQUEST_MESSAGES.item[action];
}

export function getRequestModalTitle(
  listingType: "item" | "sublet",
  action: TransactionRequestType,
): string {
  if (action === "request_buy") return "直接购买";
  return listingType === "sublet" ? "申请预订" : "申请预留";
}
