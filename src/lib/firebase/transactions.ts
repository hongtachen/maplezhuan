import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { ItemDocument, MessageType, SubletDocument } from "./firestore";
import { getUserProfile, UserProfile } from "./users";
import { updateDocument } from "./firestore";
import {
  uiStatusToItemDb,
  uiStatusToSubletDb,
  type ListingUiStatus,
} from "@/lib/listingStatus";
import {
  buildBargainDeclinedEmail,
  buildRequestDeclinedEmail,
  buildReserveAcceptedEmail,
  buildTransactionCancelledEmail,
  buildTransactionCompletedEmail,
  sendEmail,
} from "@/lib/email";

export type ItemType = "item" | "sublet";

/** Remove buyer fields from a listing when relisting or marking without a buyer. */
export const LISTING_BUYER_FIELD_CLEARS = {
  buyerId: deleteField(),
  buyerName: deleteField(),
  buyerAvatar: deleteField(),
};

export type BuyerInfo = {
  uid: string;
  nickname: string;
  avatar: string;
  email?: string;
};

export type SellerInfo = {
  uid: string;
  nickname: string;
  avatar: string;
};

export type ListingInfo = {
  id: string;
  title: string;
  price: number;
  emoji: string;
  gradientFrom?: string;
  gradientTo?: string;
};

function buyerFromProfile(profile: UserProfile): BuyerInfo {
  return {
    uid: profile.uid,
    nickname: profile.nickname || profile.email?.split("@")[0] || "用户",
    avatar:
      profile.avatarUrl ||
      (profile.nickname ? profile.nickname.charAt(0).toUpperCase() : "U"),
    email: profile.email,
  };
}

async function notifyBuyerByEmail(
  buyer: BuyerInfo,
  subject: string,
  html: string,
): Promise<void> {
  if (!buyer.email) return;
  const profile = await getUserProfile(buyer.uid);
  if (profile?.emailNotifications === false) return;
  await sendEmail(buyer.email, subject, html);
}

async function postChatMessage(
  chatId: string,
  senderId: string,
  text: string,
  msgType: MessageType,
  recipientId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);
  const unreadCounts =
    (chatSnap.data()?.unreadCounts as Record<string, number>) || {};

  await addDoc(collection(db, "messages"), {
    chatId,
    senderId,
    text,
    msgType,
    ...(metadata ? { metadata } : {}),
    createdAt: serverTimestamp(),
  });

  const newCounts = {
    ...unreadCounts,
    [recipientId]: (unreadCounts[recipientId] || 0) + 1,
  };
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    unreadCounts: newCounts,
    hiddenBy: [],
  });
}

export async function acceptReserve(params: {
  itemId: string;
  itemType: ItemType;
  buyer: BuyerInfo;
  chatId: string;
  sellerId: string;
  itemTitle: string;
}): Promise<void> {
  const { itemId, itemType, buyer, chatId, sellerId, itemTitle } = params;
  const colName = itemType === "item" ? "items" : "sublets";
  const newStatus = "已预留";

  await updateDocument(colName, itemId, {
    status: newStatus,
    buyerId: buyer.uid,
    buyerName: buyer.nickname,
    buyerAvatar: buyer.avatar,
  });

  const text = "卖家已同意预留给您。";
  await postChatMessage(chatId, sellerId, text, "action_reserved", buyer.uid);

  const reserveEmail = buildReserveAcceptedEmail({
    nickname: buyer.nickname,
    itemTitle,
    chatId,
  });
  await notifyBuyerByEmail(buyer, reserveEmail.subject, reserveEmail.html);
}

export async function confirmSold(params: {
  itemId: string;
  itemType: ItemType;
  buyer: BuyerInfo;
  seller: SellerInfo;
  chatId: string;
  listing: ListingInfo;
  finalPrice?: number;
}): Promise<void> {
  const { itemId, itemType, buyer, seller, chatId, listing, finalPrice } =
    params;
  const colName = itemType === "item" ? "items" : "sublets";
  const newStatus = itemType === "item" ? "已售出" : "已租出";
  const salePrice = finalPrice ?? listing.price;

  await updateDocument(colName, itemId, {
    status: newStatus,
    buyerId: buyer.uid,
    buyerName: buyer.nickname,
    buyerAvatar: buyer.avatar,
  });

  await addDoc(collection(db, "orders"), {
    itemId,
    itemTitle: listing.title,
    itemPrice: salePrice,
    itemEmoji: listing.emoji,
    itemGradientFrom: listing.gradientFrom,
    itemGradientTo: listing.gradientTo,
    buyerId: buyer.uid,
    buyerName: buyer.nickname,
    buyerAvatar: buyer.avatar,
    sellerId: seller.uid,
    sellerName: seller.nickname,
    sellerAvatar: seller.avatar,
    status: "已完成",
    createdAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  });

  const text =
    itemType === "item"
      ? "卖家已确认售出给您，交易完成！"
      : "卖家已确认租出给您，交易完成！";
  await postChatMessage(chatId, seller.uid, text, "action_sold", buyer.uid);

  const soldEmail = buildTransactionCompletedEmail({
    nickname: buyer.nickname,
    itemTitle: listing.title,
    chatId,
  });
  await notifyBuyerByEmail(buyer, soldEmail.subject, soldEmail.html);
}

export async function acceptBargain(params: {
  itemId: string;
  itemType: ItemType;
  buyer: BuyerInfo;
  seller: SellerInfo;
  chatId: string;
  listing: ListingInfo;
  finalPrice: number;
}): Promise<void> {
  await confirmSold({ ...params, finalPrice: params.finalPrice });
}

export async function declineBargain(params: {
  chatId: string;
  declinerId: string;
  recipientId: string;
  itemTitle: string;
}): Promise<void> {
  const { chatId, declinerId, recipientId, itemTitle } = params;
  const text = "对方未能接受您的议价，如有疑问请继续沟通。";

  await postChatMessage(
    chatId,
    declinerId,
    text,
    "action_declined",
    recipientId,
  );

  const recipientProfile = await getUserProfile(recipientId);
  if (
    recipientProfile?.email &&
    recipientProfile.emailNotifications !== false
  ) {
    const bargainDeclinedEmail = buildBargainDeclinedEmail({
      nickname: recipientProfile.nickname || "用户",
      itemTitle,
      chatId,
    });
    await sendEmail(
      recipientProfile.email,
      bargainDeclinedEmail.subject,
      bargainDeclinedEmail.html,
    );
  }
}

export async function declineRequest(params: {
  chatId: string;
  sellerId: string;
  buyer: BuyerInfo;
  itemTitle: string;
  reason?: string;
}): Promise<void> {
  const { chatId, sellerId, buyer, itemTitle, reason } = params;
  const text = reason
    ? `卖家未能接受您的申请。原因：${reason}`
    : "卖家未能接受您的申请，如有疑问请继续沟通。";

  await postChatMessage(chatId, sellerId, text, "action_declined", buyer.uid);

  const declinedEmail = buildRequestDeclinedEmail({
    nickname: buyer.nickname,
    itemTitle,
    reason,
    chatId,
  });
  await notifyBuyerByEmail(buyer, declinedEmail.subject, declinedEmail.html);
}

/** Notify buyer when seller relists after reserve/sale. */
export async function cancelOrdersForRelistedListing(params: {
  itemId: string;
  buyerId: string;
  sellerId: string;
  itemTitle: string;
  itemType: ItemType;
}): Promise<void> {
  const { itemId, buyerId, sellerId, itemTitle, itemType } = params;

  const snap = await getDocs(
    query(collection(db, "orders"), where("itemId", "==", itemId)),
  );

  const cancelText =
    itemType === "sublet"
      ? "卖家已将此转租重新上架，本次交易已取消。"
      : "卖家已将此商品重新上架，本次交易已取消。";

  let cancelledAny = false;
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.buyerId !== buyerId || data.status === "已取消") continue;
    await updateDocument("orders", docSnap.id, { status: "已取消" });
    cancelledAny = true;
  }

  const chatId = await findChatByItemAndUsers(itemId, sellerId, buyerId);
  if (chatId) {
    await postChatMessage(chatId, sellerId, cancelText, "text", buyerId);
  }

  if (cancelledAny) {
    const profile = await getUserProfile(buyerId);
    if (profile?.email) {
      const cancelledEmail = buildTransactionCancelledEmail({
        nickname: profile.nickname || "买家",
        itemTitle,
        chatId: chatId ?? undefined,
      });
      await notifyBuyerByEmail(
        buyerFromProfile(profile),
        cancelledEmail.subject,
        cancelledEmail.html,
      );
    }
  }
}

/** Return listing to on-sale and notify/cancel prior buyer transactions. */
export async function relistListing(params: {
  itemId: string;
  itemType: ItemType;
  previousBuyerId?: string;
  previousStatus: ListingUiStatus;
  sellerId: string;
  itemTitle: string;
}): Promise<void> {
  const {
    itemId,
    itemType,
    previousBuyerId,
    previousStatus,
    sellerId,
    itemTitle,
  } = params;
  const colName = itemType === "item" ? "items" : "sublets";
  const newStatus =
    itemType === "sublet"
      ? uiStatusToSubletDb("在售")
      : uiStatusToItemDb("在售");

  await updateDocument(colName, itemId, {
    status: newStatus,
    ...LISTING_BUYER_FIELD_CLEARS,
  });

  if (!previousBuyerId) return;

  if (previousStatus === "已售") {
    await cancelOrdersForRelistedListing({
      itemId,
      buyerId: previousBuyerId,
      sellerId,
      itemTitle,
      itemType,
    });
    return;
  }

  if (previousStatus === "已预留") {
    const chatId = await findChatByItemAndUsers(
      itemId,
      sellerId,
      previousBuyerId,
    );
    const reserveText =
      itemType === "sublet"
        ? "卖家已将此转租重新上架，预留已取消。"
        : "卖家已将此商品重新上架，预留已取消。";
    if (chatId) {
      await postChatMessage(
        chatId,
        sellerId,
        reserveText,
        "text",
        previousBuyerId,
      );
    }
  }
}

/** Used by profile/listings when changing status with buyer picker */
export async function changeListingStatus(params: {
  itemId: string;
  itemType: ItemType;
  uiStatus: ListingUiStatus;
  buyer: BuyerInfo | null;
  seller: SellerInfo;
  listing: ListingInfo;
}): Promise<void> {
  const { itemId, itemType, uiStatus, buyer, seller, listing } = params;
  const colName = itemType === "item" ? "items" : "sublets";

  const newStatus =
    itemType === "sublet"
      ? uiStatusToSubletDb(uiStatus)
      : uiStatusToItemDb(uiStatus);

  const updates: Record<string, unknown> = { status: newStatus };
  if (buyer && (uiStatus === "已售" || uiStatus === "已预留")) {
    updates.buyerId = buyer.uid;
    updates.buyerName = buyer.nickname;
    updates.buyerAvatar = buyer.avatar;
  } else if (uiStatus === "已售" || uiStatus === "已预留") {
    Object.assign(updates, LISTING_BUYER_FIELD_CLEARS);
  }

  await updateDocument(colName, itemId, updates);

  if (buyer && uiStatus === "已售") {
    await addDoc(collection(db, "orders"), {
      itemId,
      itemTitle: listing.title,
      itemPrice: listing.price,
      itemEmoji: listing.emoji,
      itemGradientFrom: listing.gradientFrom,
      itemGradientTo: listing.gradientTo,
      buyerId: buyer.uid,
      buyerName: buyer.nickname,
      buyerAvatar: buyer.avatar,
      sellerId: seller.uid,
      sellerName: seller.nickname,
      sellerAvatar: seller.avatar,
      status: "已完成",
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
  }

  if (buyer && (uiStatus === "已售" || uiStatus === "已预留")) {
    const chatId = await findChatByItemAndUsers(itemId, seller.uid, buyer.uid);
    if (chatId) {
      const text =
        uiStatus === "已预留"
          ? "卖家已同意预留给您。"
          : itemType === "item"
            ? "卖家已确认售出给您，交易完成！"
            : "卖家已确认租出给您，交易完成！";
      const msgType = uiStatus === "已预留" ? "action_reserved" : "action_sold";
      await postChatMessage(
        chatId,
        seller.uid,
        text,
        msgType as MessageType,
        buyer.uid,
      );

      if (uiStatus === "已售") {
        const soldEmail = buildTransactionCompletedEmail({
          nickname: buyer.nickname,
          itemTitle: listing.title,
          chatId,
          includeFeedbackNote: false,
        });
        await notifyBuyerByEmail(buyer, soldEmail.subject, soldEmail.html);
      } else if (uiStatus === "已预留") {
        const reserveEmail = buildReserveAcceptedEmail({
          nickname: buyer.nickname,
          itemTitle: listing.title,
          chatId,
        });
        await notifyBuyerByEmail(
          buyer,
          reserveEmail.subject,
          reserveEmail.html,
        );
      }
    }
  }
}

export async function findChatByItemAndUsers(
  itemId: string,
  userId: string,
  otherUserId: string,
): Promise<string | null> {
  const snap = await getDocs(
    query(collection(db, "chats"), where("itemId", "==", itemId)),
  );
  for (const d of snap.docs) {
    const participants: string[] = d.data().participants || [];
    if (participants.includes(userId) && participants.includes(otherUserId)) {
      return d.id;
    }
  }
  return null;
}

export function listingFromItem(
  item: ItemDocument | SubletDocument,
  itemType: ItemType,
  emoji = "📦",
): ListingInfo {
  const title =
    itemType === "item"
      ? (item as ItemDocument).title
      : (item as SubletDocument).title || (item as SubletDocument).address;
  return {
    id: item.id!,
    title,
    price: item.price,
    emoji: itemType === "sublet" ? "🏠" : emoji,
    gradientFrom: "#f3fbf7",
    gradientTo: "#bbf7d0",
  };
}

export { buyerFromProfile };
