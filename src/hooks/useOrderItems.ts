import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getOrdersByBuyer,
  getOrdersBySeller,
  OrderDocument,
  FirestoreReadTimestamp,
} from "@/lib/firebase/firestore";
import { formatFirestoreDate } from "@/lib/utils";

export type OrderItemView = {
  id: string;
  itemId: string;
  title: string;
  price: number;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;

  // Buyer perspective fields (used by Bought items)
  sellerId?: string;
  seller?: string;
  sellerAvatar?: string;
  boughtAt?: string;
  reviewed?: boolean;

  // Seller perspective fields (used by Sold items)
  buyerId?: string;
  buyer?: string;
  buyerAvatar?: string;
  soldAt?: string;
  status?: "已完成" | "已评价" | "进行中";
};

export function useOrderItems(role: "buyer" | "seller") {
  const [items, setItems] = useState<OrderItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const fetchFn = role === "buyer" ? getOrdersByBuyer : getOrdersBySeller;
        const data = await fetchFn(user.uid);

        const mappedItems: OrderItemView[] = data.map(
          (order: OrderDocument) => {
            const base = {
              id: order.id || "",
              itemId: order.itemId,
              title: order.itemTitle,
              price: order.itemPrice,
              emoji: order.itemEmoji,
              gradientFrom: order.itemGradientFrom || "#f3fbf7",
              gradientTo: order.itemGradientTo || "#bbf7d0",
            };

            const formattedDate = formatFirestoreDate(
              order.createdAt as FirestoreReadTimestamp,
            );

            if (role === "buyer") {
              return {
                ...base,
                sellerId: order.sellerId,
                seller: order.sellerName,
                sellerAvatar: order.sellerAvatar,
                boughtAt: formattedDate,
                reviewed: order.status === "已评价",
              };
            } else {
              return {
                ...base,
                buyerId: order.buyerId,
                buyer: order.buyerName,
                buyerAvatar: order.buyerAvatar,
                soldAt: formattedDate,
                status: order.status,
              };
            }
          },
        );

        setItems(mappedItems);
      } catch (error) {
        console.error(`Failed to fetch ${role} items:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, role]);

  return { items, setItems, loading };
}

export function useBoughtItems() {
  return useOrderItems("buyer");
}

export function useSoldItems() {
  return useOrderItems("seller");
}
