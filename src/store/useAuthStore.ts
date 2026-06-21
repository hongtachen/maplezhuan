import { create } from "zustand";
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import {
  UserProfile,
  createUserProfile,
  getUserProfile,
} from "@/lib/firebase/users";

interface AuthStore {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

let profileUnsubscribe: (() => void) | null = null;

function subscribeToUserProfile(uid: string) {
  if (profileUnsubscribe) {
    profileUnsubscribe();
    profileUnsubscribe = null;
  }
  profileUnsubscribe = onSnapshot(doc(db, "users", uid), (snap) => {
    if (snap.exists()) {
      useAuthStore.setState({ userProfile: snap.data() as UserProfile });
    }
  });
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: true,
  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists, if not create one
      let profile = await getUserProfile(user.uid);
      if (!profile) {
        await createUserProfile(user.uid, {
          email: user.email || "",
          nickname: user.displayName || user.email?.split("@")[0] || "用户",
          avatarUrl: user.photoURL || undefined,
        });
        profile = await getUserProfile(user.uid);
      }
      set({ userProfile: profile });
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      const isCancelled =
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request";
      // In development always log; in production suppress user-cancelled auth errors.
      if (!isCancelled || process.env.NODE_ENV === "development") {
        console.error("Google Login Error:", error);
      }
      throw error;
    }
  },
  loginWithEmail: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error("Email Login failed:", error);
      throw error;
    }
  },
  registerWithEmail: async (email, password, nickname) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update Firebase Auth Profile (optional but good practice)
      await updateProfile(user, { displayName: nickname });

      // Create Database Profile
      await createUserProfile(user.uid, {
        email,
        nickname,
      });

      // Fix race condition: manually fetch and set profile
      // because onAuthStateChanged might fire before createUserProfile finishes
      const profile = await getUserProfile(user.uid);
      set({ userProfile: profile });
    } catch (error: unknown) {
      console.error("Email Register failed:", error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
  refreshUserProfile: async () => {
    const uid = useAuthStore.getState().user?.uid;
    if (!uid) return;
    const profile = await getUserProfile(uid);
    if (profile) {
      useAuthStore.setState({ userProfile: profile });
    }
  },
}));

// Initialize listener
onAuthStateChanged(auth, async (user) => {
  if (profileUnsubscribe) {
    profileUnsubscribe();
    profileUnsubscribe = null;
  }

  if (user) {
    let profile = await getUserProfile(user.uid);

    // Auto-repair missing profiles
    if (!profile) {
      console.log("Profile not found in Firestore, auto-creating...");
      await createUserProfile(user.uid, {
        email: user.email || "",
        nickname: user.displayName || user.email?.split("@")[0] || "用户",
        avatarUrl: user.photoURL || undefined,
      });
      profile = await getUserProfile(user.uid);
    }

    subscribeToUserProfile(user.uid);

    useAuthStore.setState({
      user,
      userProfile: profile,
      isAuthenticated: true,
      isLoading: false,
    });
  } else {
    useAuthStore.setState({
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }
});
