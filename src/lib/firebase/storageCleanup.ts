import { deleteObject, ref } from "firebase/storage";
import { storage } from "./config";

function isFirebaseStorageUrl(url: string): boolean {
  return url.startsWith("https://firebasestorage.googleapis.com/");
}

export function getStoragePathFromDownloadUrl(url: string): string | null {
  if (!isFirebaseStorageUrl(url)) return null;
  try {
    const parsed = new URL(url);
    const pathMatch = parsed.pathname.match(/\/o\/(.+)$/);
    if (!pathMatch) return null;
    return decodeURIComponent(pathMatch[1]);
  } catch {
    return null;
  }
}

export async function deleteStorageFileByUrl(url: string): Promise<boolean> {
  const path = getStoragePathFromDownloadUrl(url);
  if (!path) return false;
  try {
    await deleteObject(ref(storage, path));
    return true;
  } catch (error) {
    console.warn(`[storage] failed to delete ${path}`, error);
    return false;
  }
}

export function getRemovedStorageUrls(
  previousUrls: string[],
  nextUrls: string[],
): string[] {
  const nextSet = new Set(nextUrls.filter(Boolean));
  return previousUrls.filter(
    (url) => url && isFirebaseStorageUrl(url) && !nextSet.has(url),
  );
}

export type ReplacedMediaCleanup = {
  previousImageUrls?: string[];
  nextImageUrls?: string[];
  previousVideoUrl?: string | null;
  nextVideoUrl?: string | null;
  previousVideoPosterUrl?: string | null;
};

export async function cleanupReplacedListingMedia(
  params: ReplacedMediaCleanup,
): Promise<void> {
  const toDelete = new Set<string>();

  for (const url of getRemovedStorageUrls(
    params.previousImageUrls ?? [],
    params.nextImageUrls ?? [],
  )) {
    toDelete.add(url);
  }

  const previousVideo = params.previousVideoUrl?.trim();
  const nextVideo = params.nextVideoUrl?.trim() || null;
  const videoChanged = (previousVideo || null) !== nextVideo;
  if (previousVideo && videoChanged && isFirebaseStorageUrl(previousVideo)) {
    toDelete.add(previousVideo);
  }

  const previousPoster = params.previousVideoPosterUrl?.trim();
  if (previousPoster && videoChanged && isFirebaseStorageUrl(previousPoster)) {
    toDelete.add(previousPoster);
  }

  await Promise.all([...toDelete].map((url) => deleteStorageFileByUrl(url)));
}

export async function cleanupListingMediaFiles(urls: {
  images?: string[];
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
}): Promise<void> {
  const toDelete = new Set<string>();

  for (const url of urls.images ?? []) {
    if (url && isFirebaseStorageUrl(url)) toDelete.add(url);
  }
  if (urls.videoUrl && isFirebaseStorageUrl(urls.videoUrl)) {
    toDelete.add(urls.videoUrl);
  }
  if (urls.videoPosterUrl && isFirebaseStorageUrl(urls.videoPosterUrl)) {
    toDelete.add(urls.videoPosterUrl);
  }

  await Promise.all([...toDelete].map((url) => deleteStorageFileByUrl(url)));
}
