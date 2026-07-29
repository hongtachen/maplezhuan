import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import { updateOrder } from "./firestore";

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
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be signed in to recalculate rating");
  }

  const token = await user.getIdToken();
  const res = await fetch("/api/reviews/recalculate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sellerId }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`recalculateSellerRating failed: ${res.status} ${detail}`);
  }

  return (await res.json()) as { rating: number; reviewCount: number };
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
