import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/store/useAuthStore";
import { ChatDocument } from "@/lib/firebase/firestore";

export function useUnreadMessages() {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setTimeout(() => setUnreadCount(0), 0);
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach((d) => {
        const chat = d.data() as ChatDocument;
        if (chat.hiddenBy?.includes(user.uid)) return;
        total += chat.unreadCounts?.[user.uid] || 0;
      });
      setUnreadCount(total);
    });

    return () => unsubscribe();
  }, [user]);

  return unreadCount;
}
