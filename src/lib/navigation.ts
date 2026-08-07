const KEY = "mz:detail-from-app";

/** Call before in-app navigations into /listing or /sublet. */
export function markDetailFromApp(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* private mode */
  }
}

export function hasDetailFromApp(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** In-app stamp → history.back(); share / cold open → replace(fallback). */
export function goBackOr(
  router: { back: () => void; replace: (href: string) => void },
  fallback = "/",
): void {
  if (hasDetailFromApp()) {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    router.back();
  } else {
    router.replace(fallback);
  }
}
