import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";

export interface UserProfile {
  uid: string;
  email: string;
  nickname: string;
  avatarUrl: string;
  isVerifiedSeller: boolean;
  sellerStatus?: "none" | "pending" | "approved" | "rejected";
  isSuspended?: boolean;
  /** Mirror of Auth custom claim — never trust for authorization. */
  isAdmin?: boolean;
  /** Bootstrap / first admin — protected from regular admin edits. */
  isSuperAdmin?: boolean;
  wechat?: string;
  phone?: string;
  isPublicContact?: boolean;
  emailNotifications?: boolean;
  defaultAddress?: {
    text: string;
    lat: number;
    lng: number;
    showExactLocation: boolean;
    city?: string;
  };
  rating?: number;
  reviewCount?: number;
  profileViews?: number;
  createdAt: number;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

type CreateProfileParams = Pick<UserProfile, "email" | "nickname"> &
  Partial<Pick<UserProfile, "avatarUrl" | "isVerifiedSeller">>;

export async function createUserProfile(
  uid: string,
  data: CreateProfileParams,
): Promise<void> {
  const docRef = doc(db, "users", uid);

  // Idempotent: register + onAuthStateChanged both call this; rewriting
  // createdAt on an existing doc fails Firestore update rules.
  const existing = await getDoc(docRef);
  if (existing.exists()) return;

  const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.nickname || uid)}`;

  const profile: UserProfile = {
    uid,
    email: data.email || "",
    nickname: data.nickname || "MapleUser",
    avatarUrl: data.avatarUrl || defaultAvatar,
    isVerifiedSeller: data.isVerifiedSeller || false,
    sellerStatus: "none",
    reviewCount: 0,
    profileViews: 0,
    createdAt: Date.now(),
  };

  try {
    await setDoc(docRef, profile);
  } catch (error: unknown) {
    // Race: another caller created the doc first
    const again = await getDoc(docRef);
    if (again.exists()) return;
    throw error;
  }
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
}

export async function uploadUserAvatar(
  uid: string,
  file: File,
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `avatars/${uid}_${Date.now()}.${fileExt}`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  await updateUserProfile(uid, { avatarUrl: downloadUrl });
  return downloadUrl;
}
