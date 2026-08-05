import { getAdminFirestore } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

/** Returns a 403 response if the user doc is suspended; otherwise null. */
export async function forbidIfSuspended(
  uid: string,
): Promise<NextResponse | null> {
  const snap = await getAdminFirestore().doc(`users/${uid}`).get();
  if (snap.exists && snap.data()?.isSuspended === true) {
    return NextResponse.json(
      { error: "账号已封禁，无法使用此功能" },
      { status: 403 },
    );
  }
  return null;
}
