import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase/config";
import {
  getUserHistory,
  FirestoreReadTimestamp,
  ItemDocument,
  SubletDocument,
} from "@/lib/firebase/firestore";
import { formatFirestoreDate } from "@/lib/utils";

export type HistoryItem = {
  id: string;
  itemId: string;
  itemType: "item" | "sublet";
  title: string;
  price: number;
  priceUnit?: string;
  image?: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  viewedAt: string;
  group: "今天" | "昨天" | "更早";
};

async function resolveListingImage(
  itemId: string,
  itemType: "item" | "sublet",
): Promise<string | undefined> {
  const collectionName = itemType === "sublet" ? "sublets" : "items";
  const snap = await getDoc(doc(db, collectionName, itemId));
  if (!snap.exists()) return undefined;
  const data = snap.data() as ItemDocument | SubletDocument;
  return data.images?.[0];
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setHistory([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getUserHistory(user.uid);

        const today = new Date();
        const todayStr = today.toLocaleDateString();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString();

        const mappedItems: HistoryItem[] = await Promise.all(
          data.map(async (h) => {
            let group: "今天" | "昨天" | "更早" = "更早";
            const viewedAtStr = formatFirestoreDate(
              h.viewedAt as FirestoreReadTimestamp | undefined,
            );

            if (viewedAtStr === todayStr || viewedAtStr === "刚刚") {
              group = "今天";
            } else if (viewedAtStr === yesterdayStr) {
              group = "昨天";
            }

            const itemType = h.itemType || "item";
            let image = h.itemImage;
            if (!image && h.itemId) {
              image = await resolveListingImage(h.itemId, itemType).catch(
                () => undefined,
              );
            }

            return {
              id: h.id || "",
              itemId: h.itemId,
              itemType,
              title: h.itemTitle,
              price: h.itemPrice,
              priceUnit: h.itemPriceUnit,
              image,
              emoji: h.itemEmoji,
              gradientFrom: h.itemGradientFrom || "#f3fbf7",
              gradientTo: h.itemGradientTo || "#bbf7d0",
              viewedAt: viewedAtStr,
              group,
            };
          }),
        );

        setHistory(mappedItems);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return { history, setHistory, loading };
}
