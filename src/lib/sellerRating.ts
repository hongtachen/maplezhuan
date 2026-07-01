import type { UserProfile } from "@/lib/firebase/users";

export type SellerRatingSnapshot = {
  rating: number | null;
  reviewCount: number;
};

export function sellerRatingFromProfile(
  profile: UserProfile | null | undefined,
): SellerRatingSnapshot {
  const reviewCount = profile?.reviewCount ?? 0;
  if (reviewCount <= 0) {
    return { rating: null, reviewCount: 0 };
  }
  const rating =
    typeof profile?.rating === "number" && profile.rating > 0
      ? profile.rating
      : null;
  return { rating, reviewCount };
}

export function formatCardRatingLabel(
  snapshot: SellerRatingSnapshot | undefined,
): string {
  if (!snapshot || snapshot.reviewCount <= 0 || snapshot.rating == null) {
    return "暂无评价";
  }
  return snapshot.rating.toFixed(1);
}
