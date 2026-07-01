"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useApp } from "./AppContext";
import StatusBadge from "./StatusBadge";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  handleViewTransitionClick,
  listingHeroStyle,
} from "@/lib/motion/viewTransition";
import FavoriteHeartIcon, {
  useFavoriteBounce,
} from "@/components/motion/FavoriteHeartIcon";
import { DURATION, EASE } from "@/lib/motion/tokens";
import { formatCardRatingLabel } from "@/lib/sellerRating";

export type ListingType = "item" | "sublet";

export interface ListingCardData {
  id: string;
  type: ListingType;
  title: string;
  price: number;
  priceUnit?: string; // e.g. "/月" for sublets
  location: string;
  city?: string;
  neighbourhood: string;
  condition?: string; // for items
  rating: number | null;
  reviewCount?: number;
  status: "available" | "reserved" | "sold";
  isTopSeller?: boolean;
  /** Emoji used as the visual placeholder inside the gradient card image */
  emoji?: string;
  /** Tailwind gradient classes for the image area */
  gradientFrom?: string;
  gradientTo?: string;

  /** Real image URL (first photo = cover) */
  image?: string;
  /** Sublet has an optional tour video on the detail page */
  hasListingVideo?: boolean;

  // Filter properties
  itemCategory?: string;
  subletTerm?: string;
  roomType?: string;
  renewable?: string;
}

interface ListingCardProps {
  listing: ListingCardData;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { isFavorite, toggleFavorite } = useApp();
  const router = useRouter();
  const { bounceKey, bounceProps, triggerBounce } = useFavoriteBounce();
  const favorited = isFavorite(listing.id);
  const hasReviews = (listing.reviewCount ?? 0) > 0 && listing.rating != null;
  const ratingLabel = formatCardRatingLabel({
    rating: listing.rating,
    reviewCount: listing.reviewCount ?? 0,
  });
  const href =
    listing.type === "sublet"
      ? `/sublet/${listing.id}`
      : `/listing/${listing.id}`;

  return (
    <Link
      href={href}
      onClick={(e) => handleViewTransitionClick(e, router, href)}
      className="flex flex-col cursor-pointer group"
    >
      <motion.article
        className="flex flex-col h-full"
        whileTap={{ scale: 0.985 }}
        transition={{ duration: DURATION.fast, ease: EASE.out }}
      >
        {/* Image area */}
        <div
          className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-2 bg-gray-100 flex items-center justify-center"
          style={listingHeroStyle(listing.type, listing.id)}
        >
          {listing.image ? (
            <img
              src={listing.image}
              alt=""
              className="w-full h-full object-contain"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${listing.gradientFrom || "#e2e8f0"}, ${listing.gradientTo || "#cbd5e1"})`,
              }}
            />
          )}
          {/* Emoji placeholder fallback */}
          {!listing.image && listing.emoji && (
            <div className="absolute inset-0 flex items-center justify-center opacity-25">
              <span className="text-5xl">{listing.emoji}</span>
            </div>
          )}

          {listing.hasListingVideo && (
            <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-medium text-[#1f2933] shadow-sm border border-white/80">
                <span aria-hidden>🎬</span>
                看房视频
              </span>
            </div>
          )}

          {/* Top-seller badge */}
          {listing.isTopSeller && (
            <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[11px] font-medium text-[#1f2933] shadow-sm">
              好评卖家
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const adding = !favorited;
              if (adding) triggerBounce();
              toggleFavorite(listing.id, listing.type);
              try {
                const collectionName =
                  listing.type === "item" ? "items" : "sublets";
                await updateDoc(doc(db, collectionName, listing.id), {
                  favorites: increment(adding ? 1 : -1),
                });
              } catch (err) {
                console.error(err);
              }
            }}
            aria-label={favorited ? "取消收藏" : "收藏"}
            className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
          >
            <FavoriteHeartIcon
              favorited={favorited}
              bounceKey={bounceKey}
              bounceProps={bounceProps}
            />
          </button>

          {/* Status badge */}
          <div className="absolute bottom-2.5 left-2.5">
            <StatusBadge status={listing.status} />
          </div>
        </div>

        {/* Card body */}
        <div className="flex flex-col gap-0.5 px-0.5">
          {/* Title + rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-[#1f2933] leading-snug line-clamp-2 flex-1">
              {listing.title}
            </h3>
            <div className="flex items-center gap-0.5 shrink-0 text-[13px]">
              {hasReviews ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-[#1f2933] fill-[#1f2933]"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="text-[#1f2933]">{ratingLabel}</span>
                </>
              ) : (
                <span className="text-[11px] text-[#5a6b73]">
                  {ratingLabel}
                </span>
              )}
            </div>
          </div>

          {/* Location */}
          <p className="text-xs text-[#5a6b73] flex items-center gap-1">
            <svg
              className="w-3 h-3 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {listing.neighbourhood ? `${listing.neighbourhood} · ` : ""}
            {listing.location}
          </p>

          {/* Condition (items only) */}
          {listing.condition && (
            <p className="text-xs text-[#5a6b73]">{listing.condition}</p>
          )}

          {/* Price */}
          <p className="text-sm font-semibold text-[#1f2933] mt-0.5">
            ${listing.price}{" "}
            <span className="font-normal text-[#5a6b73]">
              CAD{listing.priceUnit ?? ""}
            </span>
          </p>
        </div>
      </motion.article>
    </Link>
  );
}
