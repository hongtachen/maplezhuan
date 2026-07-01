import { useEffect, useMemo, useState } from "react";
import { getUserProfile } from "@/lib/firebase/users";
import {
  sellerRatingFromProfile,
  type SellerRatingSnapshot,
} from "@/lib/sellerRating";

export function useSellerRatings(sellerIds: string[]) {
  const [ratingsMap, setRatingsMap] = useState<
    Record<string, SellerRatingSnapshot>
  >({});
  const [loading, setLoading] = useState(false);

  const uniqueIds = useMemo(
    () => [...new Set(sellerIds.filter(Boolean))],
    [sellerIds],
  );
  const hasSellers = uniqueIds.length > 0;

  useEffect(() => {
    if (!hasSellers) return;

    let cancelled = false;

    void (async () => {
      setLoading(true);
      const entries = await Promise.all(
        uniqueIds.map(async (uid) => {
          const profile = await getUserProfile(uid);
          return [uid, sellerRatingFromProfile(profile)] as const;
        }),
      );

      if (!cancelled) {
        setRatingsMap(Object.fromEntries(entries));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasSellers, uniqueIds]);

  return {
    ratingsMap: hasSellers ? ratingsMap : {},
    loading: hasSellers && loading,
  };
}
