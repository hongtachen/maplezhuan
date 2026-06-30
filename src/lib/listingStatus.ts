/** Unified UI status for seller history page (items + sublets share the same tabs). */
export type ListingUiStatus = "在售" | "已预留" | "已售";

export type ListingKind = "item" | "sublet";

export const LISTING_UI_STATUSES: ListingUiStatus[] = [
  "在售",
  "已预留",
  "已售",
];

/** Map Firestore status (items or sublets) → unified tab status. */
export function dbStatusToUi(dbStatus: string): ListingUiStatus {
  switch (dbStatus) {
    case "已售出":
    case "已租出":
      return "已售";
    case "已预留":
      return "已预留";
    case "在售":
    case "招租中":
      return "在售";
    default:
      return "在售";
  }
}

/** Map unified UI status → Firestore status for items. */
export function uiStatusToItemDb(
  uiStatus: ListingUiStatus,
): "在售" | "已预留" | "已售出" {
  if (uiStatus === "已售") return "已售出";
  if (uiStatus === "已预留") return "已预留";
  return "在售";
}

/** Map unified UI status → Firestore status for sublets. */
export function uiStatusToSubletDb(
  uiStatus: ListingUiStatus,
): "招租中" | "已预留" | "已租出" {
  if (uiStatus === "已售") return "已租出";
  if (uiStatus === "已预留") return "已预留";
  return "招租中";
}

/** Badge label on listing cards (type-specific wording). */
export function getStatusBadgeLabel(
  kind: ListingKind,
  uiStatus: ListingUiStatus,
): string {
  if (kind === "sublet") {
    if (uiStatus === "在售") return "招租中";
    if (uiStatus === "已售") return "已租出";
    return "已预留";
  }
  if (uiStatus === "已售") return "已售出";
  return uiStatus;
}

/** Buyer row prefix, e.g. 售出给 / 租出给 / 预留给 */
export function getBuyerActionLabel(
  kind: ListingKind,
  uiStatus: ListingUiStatus,
): string {
  if (uiStatus === "已预留") return "预留给：";
  return kind === "sublet" ? "租出给：" : "售出给：";
}

export function getListingKindLabel(kind: ListingKind): string {
  return kind === "sublet" ? "转租" : "闲置";
}

/** Tab label on seller history page (已售 → 已成交). */
export function getUiStatusTabLabel(status: ListingUiStatus): string {
  if (status === "已售") return "已成交";
  return status;
}

export type SellerHistoryTab = "active" | "reserved" | "completed";

export const TAB_TO_UI_STATUS: Record<SellerHistoryTab, ListingUiStatus> = {
  active: "在售",
  reserved: "已预留",
  completed: "已售",
};

export const UI_STATUS_TO_TAB: Record<ListingUiStatus, SellerHistoryTab> = {
  在售: "active",
  已预留: "reserved",
  已售: "completed",
};

export function parseHistoryTab(
  tab: string | null | undefined,
): SellerHistoryTab {
  if (tab === "reserved" || tab === "completed") return tab;
  return "active";
}

/** Seller-side label for buyer review status on completed deals. */
export function getOrderReviewLabel(
  orderStatus?: "已完成" | "已评价" | "进行中" | "已取消",
): string | null {
  if (!orderStatus || orderStatus === "已取消") return null;
  if (orderStatus === "已评价") return "买家已评价";
  if (orderStatus === "已完成") return "待买家评价";
  return null;
}
