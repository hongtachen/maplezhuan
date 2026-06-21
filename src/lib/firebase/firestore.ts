import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
  Timestamp,
  FieldValue,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Timestamp as returned from Firestore document reads.
 * On the read side, Firestore always resolves timestamps to a `Timestamp`
 * object — never a `FieldValue`. Accessing `.seconds` is always safe.
 */
export type FirestoreReadTimestamp = Timestamp | null;

// Types
export type ItemDocument = {
  id?: string;
  title: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  location: string;
  city?: string;
  locationData?: {
    lat: number;
    lng: number;
    text: string;
    showExactLocation: boolean;
    city?: string;
  };
  images: string[];
  sellerId: string;
  /** Resolved timestamp on reads; use serverTimestamp() on writes. */
  createdAt: FirestoreReadTimestamp;
  buyerId?: string;
  buyerName?: string;
  buyerAvatar?: string;
  status: "在售" | "已预留" | "已售出";
  views: number;
  favorites: number;
  inquiries: number;
};

export type SubletDocument = {
  id?: string;
  title?: string;
  propertyType: string;
  spaceType: string;
  roomTypes: string[];
  leaseTerms: string[];
  moveInDate: string;
  renewable?: boolean;
  address: string;
  city?: string;
  locationData?: {
    lat: number;
    lng: number;
    text: string;
    showExactLocation: boolean;
    city?: string;
  };
  unit: string;
  hideAddress: boolean;
  images: string[];
  price: number;
  utilitiesIncluded: boolean;
  furnished: boolean;
  contactPhone: string;
  contactWechat: string;
  description: string;
  sellerId: string;
  /** Resolved timestamp on reads; use serverTimestamp() on writes. */
  createdAt: FirestoreReadTimestamp;
  buyerId?: string;
  buyerName?: string;
  buyerAvatar?: string;
  status: "招租中" | "已预留" | "已租出";
  views: number;
  favorites: number;
  inquiries: number;
};

export type OrderDocument = {
  id?: string;
  itemId: string;
  itemTitle: string;
  itemPrice: number;
  itemEmoji: string;
  itemGradientFrom?: string;
  itemGradientTo?: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  status: "已完成" | "已评价" | "进行中";
  createdAt: FirestoreReadTimestamp;
  completedAt?: FirestoreReadTimestamp;
};

export type FavoriteDocument = {
  id?: string;
  userId: string;
  itemId: string;
  itemType: "item" | "sublet";
  createdAt: FirestoreReadTimestamp;
};

export type HistoryDocument = {
  id?: string;
  userId: string;
  itemId: string;
  itemType: "item" | "sublet";
  itemTitle: string;
  itemPrice: number;
  itemPriceUnit?: string;
  itemEmoji: string;
  itemGradientFrom?: string;
  itemGradientTo?: string;
  viewedAt: FirestoreReadTimestamp;
};

export type NotificationDocument = {
  id?: string;
  userId: string;
  type: "order" | "system" | "message";
  title: string;
  content: string;
  isRead: boolean;
  link?: string;
  createdAt: FirestoreReadTimestamp;
};

export type ChatDocument = {
  id?: string;
  participants: string[];
  itemId?: string;
  itemTitle?: string;
  lastMessage?: string;
  lastMessageTime?: FirestoreReadTimestamp;
  unreadCounts?: Record<string, number>;
  hiddenBy?: string[];
};

export type MessageType =
  | "text"
  | "request_reserve"
  | "request_buy"
  | "action_reserved"
  | "action_sold"
  | "action_declined"
  | "review"
  | "image"
  | "pickup_time"
  | "contact_share";

export type MessageMetadata = {
  date?: string;
  timeSlot?: string;
  note?: string;
  phone?: string;
  wechat?: string;
  requestMessageId?: string;
  pickupConfirmed?: boolean;
  pickupConfirmedBy?: string;
};

export type MessageDocument = {
  id?: string;
  chatId: string;
  senderId: string;
  text: string;
  msgType?: MessageType;
  imageUrl?: string;
  metadata?: MessageMetadata;
  createdAt: FirestoreReadTimestamp;
};

export type ReviewDocument = {
  id?: string;
  targetUserId: string;
  /** The UID of the user who submitted this review. Required — a review without a reviewer is meaningless. */
  reviewerId: string;
  orderId?: string;
  rating: number;
  comment: string;
  createdAt: FirestoreReadTimestamp;
};

// ---------------------------------------------------------------------------
// Generic Helpers
// ---------------------------------------------------------------------------

export async function addDocument(
  collectionName: string,
  data: Record<string, unknown>,
) {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Internal helper — reads all documents ordered by createdAt within a given Collection. Not exported to prevent unbounded collection reads from outside this module. */
async function getDocuments<T>(collectionName: string): Promise<T[]> {
  const colRef = collection(db, collectionName);
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
}

export async function getUserDocuments<T>(
  collectionName: string,
  userId: string,
): Promise<T[]> {
  const colRef = collection(db, collectionName);
  const q = query(colRef, where("sellerId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Record<string, unknown>,
) {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
}

export async function updateOrder(
  orderId: string,
  data: Partial<OrderDocument>,
) {
  await updateDocument("orders", orderId, data);
}

export async function deleteDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// Specific Helpers
export async function addItem(
  itemData: Omit<ItemDocument, "id" | "createdAt">,
) {
  return addDocument("items", itemData);
}

export async function getItems(): Promise<ItemDocument[]> {
  return getDocuments<ItemDocument>("items");
}

export async function addSublet(
  subletData: Omit<SubletDocument, "id" | "createdAt">,
) {
  return addDocument("sublets", subletData);
}

export async function getSublets(): Promise<SubletDocument[]> {
  return getDocuments<SubletDocument>("sublets");
}

export async function getOrdersBySeller(sellerId: string) {
  const colRef = collection(db, "orders");
  const q = query(
    colRef,
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as OrderDocument[];
}

export async function getOrdersByBuyer(buyerId: string) {
  const colRef = collection(db, "orders");
  const q = query(
    colRef,
    where("buyerId", "==", buyerId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as OrderDocument[];
}

/** Fetches all favorites for a user, ordered by most recently saved. */
export async function getUserFavorites(
  userId: string,
): Promise<FavoriteDocument[]> {
  const colRef = collection(db, "favorites");
  const q = query(
    colRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as FavoriteDocument[];
}

/**
 * Adds a favorite for a user. Uses a deterministic doc ID so it is idempotent —
 * safe to call even if the document already exists.
 */
export async function addFavorite(
  userId: string,
  itemId: string,
  itemType: "item" | "sublet",
): Promise<void> {
  const docId = `${userId}_${itemId}`;
  const docRef = doc(db, "favorites", docId);
  await setDoc(
    docRef,
    { userId, itemId, itemType, createdAt: serverTimestamp() },
    { merge: true },
  );
}

/** Removes a favorite document. No-op if the document does not exist. */
export async function removeFavorite(
  userId: string,
  itemId: string,
): Promise<void> {
  const docId = `${userId}_${itemId}`;
  const docRef = doc(db, "favorites", docId);
  await deleteDoc(docRef);
}

export async function getUserHistory(userId: string) {
  const colRef = collection(db, "history");
  const q = query(
    colRef,
    where("userId", "==", userId),
    orderBy("viewedAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as HistoryDocument[];
}

export async function recordHistory(
  userId: string,
  data: Partial<HistoryDocument>,
) {
  if (!userId || !data.itemId) return;
  const docId = `${userId}_${data.itemId}`;
  const docRef = doc(db, "history", docId);
  await setDoc(
    docRef,
    {
      ...data,
      userId,
      viewedAt: serverTimestamp(),
    },
    { merge: true },
  ).catch(console.error);
}

export async function getUserNotifications(userId: string) {
  const colRef = collection(db, "notifications");
  const q = query(
    colRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as NotificationDocument[];
}

export async function getUserReviews(userId: string) {
  const colRef = collection(db, "reviews");
  const q = query(
    colRef,
    where("targetUserId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ReviewDocument[];
}
