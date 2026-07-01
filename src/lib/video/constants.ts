export const MAX_VIDEO_SIZE_MB = 100;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_DURATION_SEC = 60;
export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
] as const;
