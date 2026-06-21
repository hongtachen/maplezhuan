import { useState, useEffect } from "react";
import {
  getItems,
  getSublets,
  ItemDocument,
  SubletDocument,
} from "@/lib/firebase/firestore";

export type Item = ItemDocument;
export type Sublet = SubletDocument;

function useListings<T extends { status: string }>(
  fetchFn: () => Promise<T[]>,
  activeStatus?: string,
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const results = await fetchFn();
        setData(
          activeStatus
            ? results.filter((item) => item.status === activeStatus)
            : results,
        );
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFn, activeStatus]);

  return { data, setData, loading };
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
