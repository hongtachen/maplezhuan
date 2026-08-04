/**
 * Flip to true (or set NEXT_PUBLIC_PRE_APPROVAL_ENABLED=true) when you want
 * sellers and listings to wait for admin approval before going live.
 */
export const PRE_APPROVAL_ENABLED =
  process.env.NEXT_PUBLIC_PRE_APPROVAL_ENABLED === "true";

export type SellerStatus = "none" | "pending" | "approved" | "rejected";
export type ModerationStatus = "pending" | "approved" | "rejected";

export function initialSellerStatus(): SellerStatus {
  return PRE_APPROVAL_ENABLED ? "pending" : "approved";
}

export function initialModerationStatus(): ModerationStatus {
  return PRE_APPROVAL_ENABLED ? "pending" : "approved";
}

/** Whether a listing should appear on public browse / detail. */
export function isListingPubliclyVisible(listing: {
  isHidden?: boolean;
  moderationStatus?: ModerationStatus | string;
}): boolean {
  if (listing.isHidden === true) return false;
  if (!PRE_APPROVAL_ENABLED) return true;
  const status = listing.moderationStatus;
  // Legacy docs without the field stay visible
  return !status || status === "approved";
}
