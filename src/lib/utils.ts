import type { Timestamp } from "firebase/firestore";

/**
 * A Firestore Timestamp as returned from document reads.
 * On the read side, Firestore always resolves timestamps to a `Timestamp`
 * object (never a `FieldValue`). Use `FirestoreWriteTimestamp` (defined in
 * firestore.ts) for fields passed to write operations.
 */
export type FirestoreReadTimestamp = Timestamp | null;

/**
 * Converts a Firestore Timestamp to a locale date string.
 * Returns "刚刚" when the timestamp is absent or invalid.
 *
 * @example
 * formatFirestoreDate(order.createdAt) // "2025/6/20"
 */
export function formatFirestoreDate(
  ts: FirestoreReadTimestamp | undefined,
): string {
  if (!ts || !("seconds" in ts)) return "刚刚";
  return new Date(ts.seconds * 1000).toLocaleDateString();
}
