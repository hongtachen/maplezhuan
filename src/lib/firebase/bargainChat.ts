import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { buildBargainMessage } from "@/lib/bargain";
import { buildNewBargainEmail, sendEmail } from "@/lib/email";
import type { ItemType } from "./transactions";

type SendBargainOfferParams = {
  itemId: string;
  sellerId: string;
  buyerId: string;
  itemTitle: string;
  offerPrice: number;
  itemType: ItemType;
  listingCollection: "items" | "sublets";
  emailRoleLabel: string;
};

export async function sendBargainOffer(
  params: SendBargainOfferParams,
): Promise<string> {
  const {
    itemId,
    sellerId,
    buyerId,
    itemTitle,
    offerPrice,
    itemType,
    listingCollection,
    emailRoleLabel,
  } = params;

  const initialText = buildBargainMessage(offerPrice, itemType);
  const msgType = "bargain_offer";
  const metadata = { offerPrice };

  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("itemId", "==", itemId));
  const snap = await getDocs(q);

  let existingChatId: string | null = null;
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    if (
      data.participants.includes(buyerId) &&
      data.participants.includes(sellerId)
    ) {
      existingChatId = docSnap.id;
    }
  });

  let chatId: string;

  if (existingChatId) {
    chatId = existingChatId;
    await addDoc(collection(db, "messages"), {
      chatId,
      senderId: buyerId,
      text: initialText,
      msgType,
      metadata,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: initialText,
      lastMessageTime: serverTimestamp(),
      [`unreadCounts.${sellerId}`]: increment(1),
      hiddenBy: [],
    });
  } else {
    const newChat = {
      participants: [buyerId, sellerId],
      itemId,
      itemTitle,
      lastMessage: initialText,
      lastMessageTime: serverTimestamp(),
      unreadCounts: { [sellerId]: 1 },
    };
    const newDoc = await addDoc(collection(db, "chats"), newChat);
    chatId = newDoc.id;
    await addDoc(collection(db, "messages"), {
      chatId,
      senderId: buyerId,
      text: initialText,
      msgType,
      metadata,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, listingCollection, itemId), {
      inquiries: increment(1),
    }).catch(console.error);
  }

  try {
    const sellerSnap = await getDoc(doc(db, "users", sellerId));
    if (sellerSnap.exists()) {
      const sellerData = sellerSnap.data();
      if (sellerData.emailNotifications !== false && sellerData.email) {
        const { subject, html } = buildNewBargainEmail({
          nickname: sellerData.nickname || emailRoleLabel,
          roleLabel: emailRoleLabel,
          itemTitle,
          message: initialText,
          chatId,
          itemType,
        });
        await sendEmail(sellerData.email, subject, html);
      }
    }
  } catch (error) {
    console.error("Error triggering bargain email:", error);
  }

  return chatId;
}

export async function sendBargainCounterOffer(params: {
  chatId: string;
  senderId: string;
  recipientId: string;
  offerPrice: number;
  itemType: ItemType;
}): Promise<void> {
  const { chatId, senderId, recipientId, offerPrice, itemType } = params;
  const text = buildBargainMessage(offerPrice, itemType);

  await addDoc(collection(db, "messages"), {
    chatId,
    senderId,
    text,
    msgType: "bargain_offer",
    metadata: { offerPrice },
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    [`unreadCounts.${recipientId}`]: increment(1),
    hiddenBy: [],
  });
}
