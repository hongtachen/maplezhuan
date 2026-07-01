"use client";

import { useMemo } from "react";
import { useApp } from "@/components/app/AppContext";
import ListingCard, { ListingCardData } from "@/components/app/ListingCard";
import { useItems, useSublets } from "@/hooks/useListings";
import { useSellerRatings } from "@/hooks/useSellerRatings";
import {
  mapItemToListingCardWithStatus,
  mapSubletToListingCardWithStatus,
} from "@/lib/mapListingCard";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function FavoritesPage() {
  const { favoriteIds } = useApp();

  const { items, loading: itemsLoading } = useItems(undefined);
  const { sublets, loading: subletsLoading } = useSublets(undefined);

  const loading = itemsLoading || subletsLoading;

  const sellerIds = useMemo(
    () => [
      ...items.map((item) => item.sellerId),
      ...sublets.map((sublet) => sublet.sellerId),
    ],
    [items, sublets],
  );
  const { ratingsMap } = useSellerRatings(sellerIds);

  const favoriteListings = useMemo(() => {
    if (loading) return [];

    const mappedItems: ListingCardData[] = items.map((item) =>
      mapItemToListingCardWithStatus(item, ratingsMap[item.sellerId]),
    );

    const mappedSublets: ListingCardData[] = sublets.map((sublet) =>
      mapSubletToListingCardWithStatus(sublet, ratingsMap[sublet.sellerId]),
    );

    const allListings = [...mappedItems, ...mappedSublets];
    return allListings.filter((l) => favoriteIds.has(l.id));
  }, [items, sublets, favoriteIds, loading, ratingsMap]);

  return (
    <div className="flex flex-col min-h-full bg-[#f3fbf7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[rgba(31,41,51,0.08)] px-4 md:px-8 py-4">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-[#1f2933]">收藏</h1>
          <span className="text-sm font-medium text-[#5a6b73]">
            共 {favoriteListings.length} 件
          </span>
        </div>
      </header>

      {/* Grid */}
      <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-8 py-6">
        {loading ? (
          <PageLoading />
        ) : favoriteListings.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-8">
            {favoriteListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg
                className="w-8 h-8 text-[#5a6b73]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
            }
            title="暂无收藏"
            description="遇到喜欢的闲置或房源，点击右上角爱心即可收藏"
          />
        )}
      </div>
    </div>
  );
}
