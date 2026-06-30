import type { ItemType } from "@/lib/firebase/transactions";

export function formatOfferPrice(price: number, itemType: ItemType): string {
  if (price === 0) {
    return itemType === "sublet" ? "免费" : "免费";
  }
  return itemType === "sublet" ? `$${price} CAD/月` : `$${price} CAD`;
}

export function buildBargainMessage(
  offerPrice: number,
  itemType: ItemType,
): string {
  const formatted = formatOfferPrice(offerPrice, itemType);
  return itemType === "sublet"
    ? `您好，我愿意支付 ${formatted}，请问可以接受吗？`
    : `您好，我愿意收 ${formatted}，请问可以接受吗？`;
}

export function isValidBargainOffer(
  offerPrice: number,
  listPrice: number,
): boolean {
  if (Number.isNaN(offerPrice) || offerPrice < 0) return false;
  if (listPrice > 0 && offerPrice >= listPrice) return false;
  return true;
}
