import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { UserProfile } from "@/lib/firebase/users";

/** Real-time seller profile (rating, reviewCount, etc.) */
export function useSellerProfile(sellerId: string | null | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(!!sellerId);

  useEffect(() => {
    if (!sellerId) {
      setTimeout(() => {
        setProfile(null);
        setLoading(false);
      }, 0);
      return;
    }

    setTimeout(() => setLoading(true), 0);
    const unsub = onSnapshot(
      doc(db, "users", sellerId),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      () => setLoading(false),
    );

    return () => unsub();
  }, [sellerId]);

  return { profile, loading };
}

export function formatSellerRating(profile: UserProfile | null | undefined) {
  const count = profile?.reviewCount ?? 0;
  if (count === 0) {
    return { score: null as number | null, count: 0, label: "暂无评分" };
  }
  return {
    score: profile?.rating ?? 5.0,
    count,
    label: `${(profile?.rating ?? 5.0).toFixed(1)} · ${count}评价`,
  };
}
