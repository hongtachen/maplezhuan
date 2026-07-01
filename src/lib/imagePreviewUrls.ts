const previewUrlCache = new Map<string, string>();

export function filePreviewKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

export function getFilePreviewUrl(file: File): string {
  const key = filePreviewKey(file);
  const cached = previewUrlCache.get(key);
  if (cached) return cached;

  const url = URL.createObjectURL(file);
  previewUrlCache.set(key, url);
  return url;
}

export function revokeFilePreviewUrl(file: File): void {
  const key = filePreviewKey(file);
  const url = previewUrlCache.get(key);
  if (!url) return;
  URL.revokeObjectURL(url);
  previewUrlCache.delete(key);
}

export function clearAllFilePreviewUrls(): void {
  for (const url of previewUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  previewUrlCache.clear();
}
