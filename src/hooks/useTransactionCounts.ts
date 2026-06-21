import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getOrdersByBuyer,
  getOrdersBySeller,
  getUserDocuments,
} from "@/lib/firebase/firestore";

export type TransactionCounts = {
  listings: number;
  listingsActive: number;
  sold: number;
  bought: number;
  pendingReviews: number;
  loading: boolean;
};

export function useTransactionCounts(): TransactionCounts {
  const { user } = useAuthStore();
  const [counts, setCounts] = useState<Omit<TransactionCounts, "loading">>({
    listings: 0,
    listingsActive: 0,
    sold: 0,
    bought: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCounts({
        listings: 0,
        listingsActive: 0,
        sold: 0,
        bought: 0,
        pendingReviews: 0,
      });
      setLoading(false);
      return;
    }

    const fetchCounts = async () => {
      setLoading(true);
      try {
        const [items, sublets, soldOrders, boughtOrders] = await Promise.all([
          getUserDocuments("items", user.uid),
          getUserDocuments("sublets", user.uid),
          getOrdersBySeller(user.uid),
          getOrdersByBuyer(user.uid),
        ]);

        const allListings = [...items, ...sublets] as { status?: string }[];
        const activeListings = allListings.filter((l) =>
          ["在售", "招租中", "已预留"].includes(l.status || ""),
        );

        setCounts({
          listings: allListings.length,
          listingsActive: activeListings.length,
          sold: soldOrders.length,
          bought: boughtOrders.length,
          pendingReviews: boughtOrders.filter((o) => o.status !== "已评价")
            .length,
        });
      } catch (e) {
        console.error("Failed to fetch transaction counts", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [user]);

  return { ...counts, loading };
}
