"use client";

/**
 * AppContext — global state for the marketplace app.
 *
 * Favorites are synced to Firestore for authenticated users.
 * Guest (unauthenticated) users have favorites stored in localStorage only;
 * on login those favorites are merged into Firestore so nothing is lost.
 *
 * Note: `isRegisteredSeller` is derived from localStorage as a lightweight
 * preference flag. Real auth and role checks are handled by Firebase Auth
 * and Firestore (see useAuthStore).
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import Toast, { ToastType } from "@/components/ui/Toast";
import GuestFavoriteNudge from "@/components/app/GuestFavoriteNudge";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
} from "@/lib/firebase/firestore";

const LS_KEY = "maplezhuan_favorites";

interface AppContextValue {
  favoriteIds: Set<string>;
  toggleFavorite: (id: string, itemType?: "item" | "sublet") => void;
  isFavorite: (id: string) => boolean;
  showToast: (message: string, type?: ToastType) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Toast state
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    type: ToastType;
    id: number;
  } | null>(null);

  // Guest nudge — shown at most once per session
  const [showNudge, setShowNudge] = useState(false);
  const nudgeShownRef = useRef(false);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToastConfig({ message, type, id: Date.now() });
  }, []);

  // ---------------------------------------------------------------------------
  // Sync favorites when auth state changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (user) {
      // User just logged in: load from Firestore and merge guest localStorage favs
      (async () => {
        try {
          const firestoreFavs = await getUserFavorites(user.uid);
          const firestoreIds = new Set(firestoreFavs.map((f) => f.itemId));

          // Read any locally-saved guest favorites
          let localIds: string[] = [];
          try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) localIds = JSON.parse(raw) as string[];
          } catch {
            /* ignore */
          }

          // Merge guest favorites into Firestore (fire-and-forget per item)
          const mergePromises = localIds
            .filter((id) => !firestoreIds.has(id))
            .map((id) => addFavorite(user.uid, id, "item")); // itemType unknown for legacy local data; default to "item"
          if (mergePromises.length > 0) {
            await Promise.allSettled(mergePromises);
            localIds.forEach((id) => firestoreIds.add(id));
          }

          // Clear localStorage now that data is in Firestore
          try {
            localStorage.removeItem(LS_KEY);
          } catch {
            /* ignore */
          }

          setFavoriteIds(firestoreIds);
        } catch (e) {
          console.error("Failed to load favorites from Firestore", e);
        }
      })();
    } else {
      // User logged out — load from localStorage (guest mode)
      setTimeout(() => {
        setFavoriteIds(new Set());
        try {
          const raw = localStorage.getItem(LS_KEY);
          if (raw) setFavoriteIds(new Set(JSON.parse(raw) as string[]));
        } catch {
          /* ignore */
        }
      }, 0);
    }
  }, [user]);

  // ---------------------------------------------------------------------------
  // Toggle favorite
  // ---------------------------------------------------------------------------
  const toggleFavorite = useCallback(
    (id: string, itemType: "item" | "sublet" = "item") => {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        const adding = !next.has(id);

        if (adding) {
          next.add(id);
        } else {
          next.delete(id);
        }

        if (user) {
          // Authenticated: sync to Firestore (fire-and-forget, errors are non-fatal)
          if (adding) {
            addFavorite(user.uid, id, itemType).catch((e) =>
              console.error("addFavorite failed", e),
            );
          } else {
            removeFavorite(user.uid, id).catch((e) =>
              console.error("removeFavorite failed", e),
            );
          }
        } else {
          // Guest: persist to localStorage
          try {
            localStorage.setItem(LS_KEY, JSON.stringify([...next]));
          } catch {
            /* ignore */
          }

          // Show nudge once per session on first save
          if (adding && !nudgeShownRef.current) {
            nudgeShownRef.current = true;
            setShowNudge(true);
          }
        }

        return next;
      });
    },
    [user],
  );

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds],
  );

  return (
    <AppContext.Provider
      value={{ favoriteIds, toggleFavorite, isFavorite, showToast }}
    >
      {children}

      {toastConfig && (
        <Toast
          key={toastConfig.id}
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {showNudge && (
        <GuestFavoriteNudge onDismiss={() => setShowNudge(false)} />
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
