import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import {
  getItems,
  getSublets,
  ItemDocument,
  SubletDocument,
} from "@/lib/firebase/firestore";
import { isListingPubliclyVisible } from "@/lib/moderation/config";

export type Item = ItemDocument;
export type Sublet = SubletDocument;

function useListings<
  T extends { status: string; isHidden?: boolean; moderationStatus?: string },
>(fetchFn: () => Promise<T[]>, activeStatus?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const results = await fetchFn();
        const visible = results.filter((item) =>
          isListingPubliclyVisible(item),
        );
        setData(
          activeStatus
            ? visible.filter(
                (item) =>
                  item.status === activeStatus || item.status === "已预留",
              )
            : visible,
        );
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFn, activeStatus]);

  return {
    data,
    setData: setData as Dispatch<SetStateAction<T[]>>,
    loading,
  };
}

export function useItems(statusFilter: string | undefined = "在售") {
  const { data, setData, loading } = useListings<ItemDocument>(
    getItems,
    statusFilter,
  );
  return { items: data, setItems: setData, loading };
}

export function useSublets(statusFilter: string | undefined = "招租中") {
  const { data, setData, loading } = useListings<SubletDocument>(
    getSublets,
    statusFilter,
  );
  return { sublets: data, setSublets: setData, loading };
}
