import {
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_DURATION_SEC,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_SIZE_MB,
} from "./constants";
import { withTimeout } from "./withTimeout";

const DURATION_TIMEOUT_MS = 15_000;

export type VideoValidationResult =
  | { ok: true; durationSec: number }
  | { ok: false; error: string };

export function validateVideoFile(file: File): VideoValidationResult {
  if (
    !ALLOWED_VIDEO_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_VIDEO_MIME_TYPES)[number],
    )
  ) {
    return { ok: false, error: "仅支持 MP4 或 MOV 格式视频" };
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      error: `视频大小为 ${sizeMb}MB，不能超过 ${MAX_VIDEO_SIZE_MB}MB`,
    };
  }

  return { ok: true, durationSec: 0 };
}

export function getVideoDuration(file: File): Promise<number> {
  const work = new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("无法读取视频信息"));
    };
    video.src = url;
    video.load();
  });

  return withTimeout(work, DURATION_TIMEOUT_MS, "读取视频时长超时");
}

export async function validateVideoFileWithDuration(
  file: File,
): Promise<VideoValidationResult> {
  const basic = validateVideoFile(file);
  if (!basic.ok) return basic;

  try {
    const durationSec = await getVideoDuration(file);
    if (durationSec > MAX_VIDEO_DURATION_SEC) {
      return {
        ok: false,
        error: `视频时长不能超过 ${MAX_VIDEO_DURATION_SEC} 秒`,
      };
    }
    if (!Number.isFinite(durationSec) || durationSec <= 0) {
      return { ok: false, error: "无法读取视频时长" };
    }
    return { ok: true, durationSec: Math.round(durationSec) };
  } catch {
    return { ok: false, error: "无法读取视频信息" };
  }
}
