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
  sendEmailVerification,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import {
  UserProfile,
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "@/lib/firebase/users";
import { assertEmailAllowed } from "@/lib/auth/disposableEmailDomains";
import { getEmailVerificationContinueUrl } from "@/lib/auth/emailVerification";

interface AuthStore {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, nickname: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  reloadUser: () => Promise<void>;
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
      provider.setCustomParameters({
        prompt: "select_account",
      });
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
      assertEmailAllowed(email);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Set Auth displayName before Firestore so onAuthStateChanged
      // auto-create (if it races) prefers this over the email local-part.
      await updateProfile(user, { displayName: nickname });

      await createUserProfile(user.uid, {
        email,
        nickname,
      });

      // createUserProfile is idempotent: if onAuthStateChanged already wrote
      // a doc with email-derived nickname, overwrite with the chosen one.
      await updateUserProfile(user.uid, { nickname });

      try {
        await sendEmailVerification(user, {
          url: getEmailVerificationContinueUrl(),
          handleCodeInApp: false,
        });
      } catch (verifyError) {
        console.error("sendEmailVerification failed:", verifyError);
      }

      const profile = await getUserProfile(user.uid);
      set({ userProfile: profile });
    } catch (error: unknown) {
      console.error("Email Register failed:", error);
      throw error;
    }
  },
  resendEmailVerification: async () => {
    const user = auth.currentUser;
    if (!user) {
      throw Object.assign(new Error("Not signed in"), {
        code: "auth/unauthenticated",
      });
    }
    if (user.emailVerified) return;
    await sendEmailVerification(user, {
      url: getEmailVerificationContinueUrl(),
      handleCodeInApp: false,
    });
  },
  reloadUser: async () => {
    const user = auth.currentUser;
    if (!user) return;
    await user.reload();
    // Force a fresh ID token so Firestore rules see email_verified promptly.
    await auth.currentUser?.getIdToken(true);
    const refreshed = auth.currentUser;
    if (refreshed) {
      useAuthStore.setState({ user: refreshed });
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
