import { auth } from "@/lib/firebase/config";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  if (!to) return;

  const user = auth.currentUser;
  if (!user) {
    console.warn("sendEmail skipped: not signed in");
    return;
  }

  const token = await user.getIdToken();
  const res = await fetch("/api/email/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, html }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("sendEmail failed:", res.status, detail);
  }
}
