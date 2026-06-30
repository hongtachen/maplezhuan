import type { ItemType } from "@/lib/firebase/transactions";

export const BARGAIN_MESSAGE_TEMPLATES = {
  item: "您好，我愿意收 {price}，请问可以接受吗？",
  sublet: "您好，我愿意支付 {price}，请问可以接受吗？",
} as const;

export function formatOfferPrice(price: number, itemType: ItemType): string {
  if (price === 0) {
    return "免费";
  }
  return itemType === "sublet" ? `$${price} CAD/月` : `$${price} CAD`;
}

export function buildBargainMessage(
  offerPrice: number,
  itemType: ItemType,
): string {
  const formatted = formatOfferPrice(offerPrice, itemType);
  const template =
    itemType === "sublet"
      ? BARGAIN_MESSAGE_TEMPLATES.sublet
      : BARGAIN_MESSAGE_TEMPLATES.item;
  return template.replace("{price}", formatted);
}

export function isValidBargainOffer(
  offerPrice: number,
  listPrice: number,
): boolean {
  if (Number.isNaN(offerPrice) || offerPrice < 0) return false;
  if (listPrice > 0 && offerPrice >= listPrice) return false;
  return true;
}
