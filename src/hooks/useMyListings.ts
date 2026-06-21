import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getUserDocuments,
  ItemDocument,
  SubletDocument,
  FirestoreReadTimestamp,
} from "@/lib/firebase/firestore";
import { formatFirestoreDate } from "@/lib/utils";

export type ListingStatus = "在售" | "已预留" | "已售";

export type MyListing = {
  id: string;
  title: string;
  price: number;
  description: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  postedAt: string;
  views: number;
  favorites: number;
  inquiries: number;
  status: ListingStatus;
  location?: string;
  image?: string;
  buyerName?: string;
  buyerAvatar?: string;
};

export function useMyListings() {
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchMyListings = async () => {
      if (!user) {
        setListings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [items, sublets] = await Promise.all([
          getUserDocuments<ItemDocument>("items", user.uid),
          getUserDocuments<SubletDocument>("sublets", user.uid),
        ]);

        const mappedItems: (MyListing & { _sortTime: number })[] = items.map(
          (i: ItemDocument) => ({
            id: i.id || "",
            title: i.title,
            price: i.price,
            description: i.description,
            emoji: "📦", // default emoji
            gradientFrom: "#e0f2fe",
            gradientTo: "#bae6fd",
            postedAt: formatFirestoreDate(
              i.createdAt as FirestoreReadTimestamp | undefined,
            ),
            views: i.views || 0,
            favorites: i.favorites || 0,
            inquiries: i.inquiries || 0,
            status: (i.status === "已售出"
              ? "已售"
              : i.status) as ListingStatus,
            location: i.location,
            image: i.images?.[0],
            buyerName: i.buyerName,
            buyerAvatar: i.buyerAvatar,
            // Store raw timestamp for sorting
            _sortTime:
              i.createdAt && "seconds" in i.createdAt ? i.createdAt.seconds : 0,
          }),
        );

        const mappedSublets: (MyListing & { _sortTime: number })[] =
          sublets.map((s: SubletDocument) => ({
            id: s.id || "",
            title:
              s.title || `${s.roomTypes?.[0] || "房间"} in ${s.propertyType}`,
            price: s.price,
            description: s.description,
            emoji: "🏠", // default emoji
            gradientFrom: "#fce7f3",
            gradientTo: "#fbcfe8",
            postedAt: formatFirestoreDate(
              s.createdAt as FirestoreReadTimestamp | undefined,
            ),
            views: s.views || 0,
            favorites: s.favorites || 0,
            inquiries: s.inquiries || 0,
            status: (s.status === "招租中" ? "在售" : "已售") as ListingStatus,
            location: s.address,
            image: s.images?.[0],
            buyerName: s.buyerName,
            buyerAvatar: s.buyerAvatar,
            // Store raw timestamp for sorting
            _sortTime:
              s.createdAt && "seconds" in s.createdAt ? s.createdAt.seconds : 0,
          }));

        const combined = [...mappedItems, ...mappedSublets]
          .sort((a, b) => {
            return b._sortTime - a._sortTime;
          })
          .map((item) => {
            // Remove internal sort field
            const { _sortTime, ...rest } = item;
            return rest;
          });

        setListings(combined);
      } catch (error) {
        console.error("Failed to fetch user listings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [user]);

  return { listings, setListings, loading };
}
