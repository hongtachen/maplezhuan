import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  getUserDocuments,
  ItemDocument,
  SubletDocument,
  FirestoreReadTimestamp,
} from "@/lib/firebase/firestore";
import { recalculateSellerRating } from "@/lib/firebase/reviews";
import { formatFirestoreDate } from "@/lib/utils";

export type Review = {
  id: string;
  reviewerMaskedName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  timeAgo: string;
};

/**
 * Public-facing view model for a seller profile page.
 * This is the presentation shape used by useUser — distinct from the
 * canonical `UserProfile` in `src/lib/firebase/users.ts` which represents
 * the full Firestore document.
 */
export type PublicSellerProfile = {
  id: string;
  nickname: string;
  isVerified: boolean;
  rating: number | null;
  reviewCount: number;
  avatarUrl?: string;
};

export type UserListing = {
  id: string;
  type: "item" | "sublet";
  title: string;
  price: number;
  condition: string;
  images: string[];
  createdAt: FirestoreReadTimestamp;
};

function mapReviewDoc(r: {
  id?: string;
  rating: number;
  comment: string;
  createdAt?: { seconds: number };
}) {
  return {
    id: r.id || "",
    reviewerMaskedName: "买家***",
    reviewerAvatar: "U",
    rating: r.rating,
    comment: r.comment,
    timeAgo: formatFirestoreDate(
      r.createdAt as FirestoreReadTimestamp | undefined,
    ),
  };
}

export function useUser(userId: string) {
  const [user, setUser] = useState<PublicSellerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [items, setItems] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    setTimeout(() => setLoading(true), 0);
    let profileReady = false;
    let reviewsReady = false;
    let listingsReady = false;

    const maybeDone = () => {
      if (profileReady && reviewsReady && listingsReady) {
        setLoading(false);
      }
    };

    const unsubProfile = onSnapshot(doc(db, "users", userId), (snap) => {
      if (snap.exists()) {
        const p = snap.data();
        setUser({
          id: userId,
          nickname: p.nickname || "用户",
          isVerified: !!p.isVerifiedSeller,
          rating:
            (p.reviewCount ?? 0) > 0 && typeof p.rating === "number"
              ? p.rating
              : null,
          reviewCount: p.reviewCount ?? 0,
          avatarUrl: p.avatarUrl,
        } satisfies PublicSellerProfile);
      } else {
        setUser(null);
      }
      profileReady = true;
      maybeDone();
    });

    const reviewsQuery = query(
      collection(db, "reviews"),
      where("targetUserId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const unsubReviews = onSnapshot(reviewsQuery, (snap) => {
      setReviews(
        snap.docs.map((d) =>
          mapReviewDoc({ id: d.id, ...d.data() } as Parameters<
            typeof mapReviewDoc
          >[0]),
        ),
      );
      reviewsReady = true;
      maybeDone();
    });

    const fetchListings = async () => {
      try {
        const userItems = await getUserDocuments<ItemDocument>("items", userId);
        const activeItems: UserListing[] = userItems
          .filter((item) => item.status === "在售")
          .map((item) => ({
            id: item.id!,
            type: "item" as const,
            title: item.title,
            price: item.price,
            condition: item.condition,
            images: item.images || [],
            createdAt: item.createdAt,
          }));

        const userSublets = await getUserDocuments<SubletDocument>(
          "sublets",
          userId,
        );
        const activeSublets: UserListing[] = userSublets
          .filter((sublet) => sublet.status === "招租中")
          .map((sublet) => ({
            id: sublet.id!,
            type: "sublet" as const,
            title: `${sublet.propertyType} ${sublet.spaceType}出租`,
            price: sublet.price,
            condition: sublet.propertyType,
            images: sublet.images || [],
            createdAt: sublet.createdAt,
          }));

        const allListings = [...activeItems, ...activeSublets].sort((a, b) => {
          const timeA = a.createdAt?.seconds ?? 0;
          const timeB = b.createdAt?.seconds ?? 0;
          return timeB - timeA;
        });

        setItems(allListings);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        listingsReady = true;
        maybeDone();
      }
    };

    fetchListings();

    return () => {
      unsubProfile();
      unsubReviews();
    };
  }, [userId]);

  // Sync rating aggregate when review list and profile count diverge (legacy data heal)
  useEffect(() => {
    if (!userId || !user || reviews.length === 0) return;
    if (user.reviewCount !== reviews.length) {
      recalculateSellerRating(userId).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user?.reviewCount, reviews.length]);

  return { user, reviews, items, loading };
}
