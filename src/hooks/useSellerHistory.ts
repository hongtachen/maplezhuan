import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getOrdersBySeller,
  OrderDocument,
  FirestoreReadTimestamp,
  getUserDocuments,
  ItemDocument,
  SubletDocument,
} from "@/lib/firebase/firestore";
import { formatFirestoreDate } from "@/lib/utils";
import { MyListing } from "@/hooks/useMyListings";
import { dbStatusToUi } from "@/lib/listingStatus";

export type SellerHistoryListing = MyListing & {
  orderId?: string;
  orderStatus?: "已完成" | "已评价" | "进行中" | "已取消";
  completedAt?: string;
};

function orderTimestamp(order: OrderDocument): number {
  const ts = order.createdAt;
  return ts && "seconds" in ts ? ts.seconds : 0;
}

/** Only link an order when its buyer matches the listing's current buyer. */
function findOrderForListing(
  listing: MyListing,
  orders: OrderDocument[],
): OrderDocument | undefined {
  if (!listing.buyerId) return undefined;

  const itemOrders = orders
    .filter((o) => o.itemId === listing.id)
    .sort((a, b) => orderTimestamp(b) - orderTimestamp(a));

  return itemOrders.find(
    (o) => o.buyerId === listing.buyerId && o.status !== "已取消",
  );
}

function mapListingWithOrder(
  listing: MyListing,
  order?: OrderDocument,
): SellerHistoryListing {
  if (!order) return listing;

  const completedAt = formatFirestoreDate(
    (order.completedAt || order.createdAt) as
      | FirestoreReadTimestamp
      | undefined,
  );

  return {
    ...listing,
    orderId: order.id,
    orderStatus: order.status,
    completedAt,
  };
}

async function fetchMyListingsRaw(userId: string): Promise<MyListing[]> {
  const [items, sublets] = await Promise.all([
    getUserDocuments<ItemDocument>("items", userId),
    getUserDocuments<SubletDocument>("sublets", userId),
  ]);

  const mappedItems: (MyListing & { _sortTime: number })[] = items.map((i) => ({
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
  }));

  const mappedSublets: (MyListing & { _sortTime: number })[] = sublets.map(
    (s) => ({
      id: s.id || "",
      listingType: "sublet" as const,
      title: s.title || `${s.roomTypes?.[0] || "房间"} in ${s.propertyType}`,
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
    }),
  );

  return [...mappedItems, ...mappedSublets]
    .sort((a, b) => b._sortTime - a._sortTime)
    .map(({ _sortTime, ...rest }) => rest);
}

export function useSellerHistory() {
  const [listings, setListings] = useState<SellerHistoryListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [refreshToken, setRefreshToken] = useState(0);

  const refetch = useCallback(() => {
    setRefreshToken((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!user) {
        if (!cancelled) {
          setListings([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const [rawListings, orders] = await Promise.all([
          fetchMyListingsRaw(user.uid),
          getOrdersBySeller(user.uid),
        ]);

        const enriched = rawListings.map((listing) =>
          mapListingWithOrder(listing, findOrderForListing(listing, orders)),
        );

        if (!cancelled) setListings(enriched);
      } catch (error) {
        console.error("Failed to fetch seller history", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [user, refreshToken]);

  return { listings, setListings, loading, refetch };
}
