import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getUserDocuments,
  ItemDocument,
  SubletDocument,
  FirestoreReadTimestamp,
} from "@/lib/firebase/firestore";
import { formatFirestoreDate } from "@/lib/utils";
import {
  dbStatusToUi,
  ListingKind,
  ListingUiStatus,
} from "@/lib/listingStatus";

export type ListingStatus = ListingUiStatus;

export type MyListing = {
  id: string;
  listingType: ListingKind;
  title: string;
  price: number;
  priceUnit?: string;
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
  buyerId?: string;
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
            listingType: "item" as const,
            title: i.title,
            price: i.price,
            description: i.description,
            emoji: "📦",
            gradientFrom: "#e0f2fe",
            gradientTo: "#bae6fd",
            postedAt: formatFirestoreDate(
              i.createdAt as FirestoreReadTimestamp | undefined,
            ),
            views: i.views || 0,
            favorites: i.favorites || 0,
            inquiries: i.inquiries || 0,
            status: dbStatusToUi(i.status),
            location: i.location,
            image: i.images?.[0],
            buyerName: i.buyerName,
            buyerAvatar: i.buyerAvatar,
            buyerId: i.buyerId,
            _sortTime:
              i.createdAt && "seconds" in i.createdAt ? i.createdAt.seconds : 0,
          }),
        );

        const mappedSublets: (MyListing & { _sortTime: number })[] =
          sublets.map((s: SubletDocument) => ({
            id: s.id || "",
            listingType: "sublet" as const,
            title:
              s.title || `${s.roomTypes?.[0] || "房间"} in ${s.propertyType}`,
            price: s.price,
            priceUnit: "/月",
            description: s.description,
            emoji: "🏠",
            gradientFrom: "#fce7f3",
            gradientTo: "#fbcfe8",
            postedAt: formatFirestoreDate(
              s.createdAt as FirestoreReadTimestamp | undefined,
            ),
            views: s.views || 0,
            favorites: s.favorites || 0,
            inquiries: s.inquiries || 0,
            status: dbStatusToUi(s.status),
            location: s.address,
            image: s.images?.[0],
            buyerName: s.buyerName,
            buyerAvatar: s.buyerAvatar,
            buyerId: s.buyerId,
            _sortTime:
              s.createdAt && "seconds" in s.createdAt ? s.createdAt.seconds : 0,
          }));

        const combined = [...mappedItems, ...mappedSublets]
          .sort((a, b) => b._sortTime - a._sortTime)
          .map(({ _sortTime, ...rest }) => rest);

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
