/** In-app → history.back(); share / cold open → replace(fallback). */
export function goBackOr(
  router: { back: () => void; replace: (href: string) => void },
  fallback = "/",
): void {
  let fromOurSite = false;
  try {
    fromOurSite =
      !!document.referrer &&
      new URL(document.referrer).origin === window.location.origin;
  } catch {
    /* ignore */
  }
  if (fromOurSite && window.history.length > 1) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
