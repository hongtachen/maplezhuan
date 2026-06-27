import type { CSSProperties, MouseEvent } from "react";
import type { ListingType } from "@/components/app/ListingCard";

type RouterLike = {
  push: (href: string) => void;
};

/** Stable View Transition name for listing card → detail hero image. */
export function listingHeroTransitionName(
  type: ListingType,
  id: string,
): string {
  return `${type}-hero-${id}`;
}

/** Navigate with the View Transitions API when supported (graceful fallback). */
export function navigateWithTransition(router: RouterLike, href: string): void {
  if (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    typeof document.startViewTransition === "function"
  ) {
    document.startViewTransition(() => {
      router.push(href);
    });
    return;
  }
  router.push(href);
}

/** Use on `<Link>` click to opt into shared-element transitions. */
export function handleViewTransitionClick(
  e: MouseEvent<HTMLAnchorElement>,
  router: RouterLike,
  href: string,
): void {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
    return;
  }
  if (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    typeof document.startViewTransition === "function"
  ) {
    e.preventDefault();
    navigateWithTransition(router, href);
  }
}

export function listingHeroStyle(type: ListingType, id: string): CSSProperties {
  return {
    viewTransitionName: listingHeroTransitionName(type, id),
  };
}
