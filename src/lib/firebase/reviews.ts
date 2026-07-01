import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { getUserReviews, updateOrder } from "./firestore";
import { updateUserProfile } from "./users";

export type SubmitReviewParams = {
  targetUserId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  orderId?: string;
  itemId?: string;
};

export async function recalculateSellerRating(sellerId: string): Promise<{
  rating: number;
  reviewCount: number;
}> {
  const reviews = await getUserReviews(sellerId);
  const reviewCount = reviews.length;
  const rating =
    reviewCount === 0
      ? 0
      : Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10,
        ) / 10;

  await updateUserProfile(sellerId, { rating, reviewCount });
  return { rating, reviewCount };
}

export async function submitReview(params: SubmitReviewParams): Promise<void> {
  const { targetUserId, reviewerId, rating, comment, orderId, itemId } = params;

  await addDoc(collection(db, "reviews"), {
    targetUserId,
    reviewerId,
    rating,
    comment,
    ...(orderId ? { orderId } : {}),
    ...(itemId ? { itemId } : {}),
    createdAt: serverTimestamp(),
  });

  await recalculateSellerRating(targetUserId);

  if (orderId) {
    await updateOrder(orderId, { status: "已评价" });
  }
}
