import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

/** Blocks duplicate increments from React Strict Mode remounts (within a few seconds). */
const VIEW_DEDUPE_MS = 3000;

function viewDedupeKey(collection: "items" | "sublets", id: string): string {
  return `listing-view:${collection}:${id}`;
}

function shouldRecordView(
  collection: "items" | "sublets",
  id: string,
): boolean {
  if (typeof sessionStorage === "undefined") return true;
  const key = viewDedupeKey(collection, id);
  const last = sessionStorage.getItem(key);
  const now = Date.now();
  if (last && now - Number(last) < VIEW_DEDUPE_MS) {
    return false;
  }
  sessionStorage.setItem(key, String(now));
  return true;
}

/** Increment listing views once per navigation (deduped against Strict Mode double-mount). */
export function incrementListingViewsOnce(
  collection: "items" | "sublets",
  id: string,
): void {
  if (!id || !shouldRecordView(collection, id)) return;
  updateDoc(doc(db, collection, id), { views: increment(1) }).catch(
    console.error,
  );
}
