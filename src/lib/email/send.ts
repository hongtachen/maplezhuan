import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  if (!to) return;
  await addDoc(collection(db, "mail"), {
    to,
    message: { subject, html },
  });
}
