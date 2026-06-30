/** Unified UI status for 我发布的 (items + sublets share the same tabs). */
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
