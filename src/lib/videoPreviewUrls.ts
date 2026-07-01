import { filePreviewKey } from "@/lib/imagePreviewUrls";

const previewUrlCache = new Map<string, string>();

export function getVideoPreviewUrl(file: File): string {
  const key = filePreviewKey(file);
  const cached = previewUrlCache.get(key);
  if (cached) return cached;

  const url = URL.createObjectURL(file);
  previewUrlCache.set(key, url);
  return url;
}

export function revokeVideoPreviewUrl(file: File): void {
  const key = filePreviewKey(file);
  const url = previewUrlCache.get(key);
  if (!url) return;
  URL.revokeObjectURL(url);
  previewUrlCache.delete(key);
}

export function clearAllVideoPreviewUrls(): void {
  for (const url of previewUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  previewUrlCache.clear();
}
