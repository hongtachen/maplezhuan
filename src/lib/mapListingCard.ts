import type { ListingCardData } from "@/components/app/ListingCard";
import type { ItemDocument, SubletDocument } from "@/lib/firebase/firestore";
import type { SellerRatingSnapshot } from "@/lib/sellerRating";

function applySellerRating(
  card: ListingCardData,
  snapshot: SellerRatingSnapshot | undefined,
): ListingCardData {
  return {
    ...card,
    rating: snapshot?.rating ?? null,
    reviewCount: snapshot?.reviewCount ?? 0,
  };
}

export function mapItemToListingCard(
  item: ItemDocument,
  sellerRating?: SellerRatingSnapshot,
): ListingCardData {
  return applySellerRating(
    {
      id: item.id || "unknown",
      type: "item",
      title: item.title,
      price: item.price,
      location: item.location,
      city: item.city || item.locationData?.city,
      neighbourhood: "",
      condition: item.condition,
      rating: null,
      reviewCount: 0,
      status: "available",
      image: item.images?.[0],
      itemCategory: item.category,
    },
    sellerRating,
  );
}

export function mapSubletToListingCard(
  sublet: SubletDocument,
  sellerRating?: SellerRatingSnapshot,
): ListingCardData {
  return applySellerRating(
    {
      id: sublet.id || "unknown",
      type: "sublet",
      title:
        sublet.title ||
        `${sublet.roomTypes?.[0] || "房间"} in ${sublet.propertyType}`,
      price: sublet.price,
      priceUnit: "/月",
      location: sublet.address,
      city: sublet.city || sublet.locationData?.city,
      neighbourhood: sublet.hideAddress ? "隐蔽地址" : "",
      rating: null,
      reviewCount: 0,
      status: "available",
      image: sublet.images?.[0],
      hasListingVideo: !!sublet.videoUrl,
      roomType: sublet.roomTypes?.[0],
      subletTerm: sublet.leaseTerms?.[0],
      renewable:
        sublet.renewable === true
          ? "可续租"
          : sublet.renewable === false
            ? "不可续租"
            : undefined,
    },
    sellerRating,
  );
}

export function mapItemToListingCardWithStatus(
  item: ItemDocument,
  sellerRating?: SellerRatingSnapshot,
): ListingCardData {
  const card = mapItemToListingCard(item, sellerRating);
  return {
    ...card,
    status: item.status === "在售" ? "available" : "sold",
  };
}

export function mapSubletToListingCardWithStatus(
  sublet: SubletDocument,
  sellerRating?: SellerRatingSnapshot,
): ListingCardData {
  const card = mapSubletToListingCard(sublet, sellerRating);
  return {
    ...card,
    status: sublet.status === "招租中" ? "available" : "sold",
  };
}
