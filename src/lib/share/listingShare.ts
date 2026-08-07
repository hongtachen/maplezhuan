import { SITE_URL } from "@/lib/constants";

export type ListingShareKind = "item" | "sublet";

export function listingShareUrl(kind: ListingShareKind, id: string): string {
  const path = kind === "item" ? "listing" : "sublet";
  return `${SITE_URL}/${path}/${id}`;
}

export function formatSharePrice(price: number): string {
  return price === 0 ? "免费" : `$${price} CAD`;
}

/** Caption only (no URL) — safe to pass with `url` to navigator.share. */
export function buildShareCaption(input: {
  title: string;
  price: number;
}): string {
  return `「${input.title}」${formatSharePrice(input.price)}`;
}

/** Caption + URL for 小红书 paste. */
export function buildShareText(input: {
  title: string;
  price: number;
  url: string;
}): string {
  return `${buildShareCaption(input)}\n${input.url}`;
}

export async function copyText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export function canNativeShare(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

/** Caption without URL + url field — one OG card, price visible in Messages. */
export async function nativeShare(input: {
  text: string;
  url: string;
}): Promise<"shared" | "cancelled" | "unsupported"> {
  if (!canNativeShare()) return "unsupported";
  try {
    await navigator.share({ text: input.text, url: input.url });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return "cancelled";
    }
    throw err;
  }
}
