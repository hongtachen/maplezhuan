"use client";

import { useMemo, useRef, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { validateVideoFileWithDuration } from "@/lib/video/validateVideo";
import { MAX_VIDEO_SIZE_MB } from "@/lib/video/constants";
import {
  getVideoPreviewUrl,
  revokeVideoPreviewUrl,
} from "@/lib/videoPreviewUrls";

type Props = {
  video?: File | string | null;
  onVideoChange: (video: File | string | null) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export default function VideoUpload({
  video,
  onVideoChange,
  onError,
  disabled,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [validating, setValidating] = useState(false);
  const [readySrc, setReadySrc] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => (video instanceof File ? getVideoPreviewUrl(video) : null),
    [video],
  );

  const hasVideo = !!video;
  const isBusy = validating || disabled;
  const showVideoPlayer = hasVideo && !validating;

  const videoSrc = typeof video === "string" ? video : previewUrl || undefined;
  const previewReady = !!videoSrc && readySrc === videoSrc;

  const markPreviewReady = () => {
    if (videoSrc) setReadySrc(videoSrc);
  };

  const handleVideoRef = (node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (!node || !videoSrc) return;
    if (node.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setReadySrc(videoSrc);
    }
  };

  const handlePick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setValidating(true);
    try {
      const result = await validateVideoFileWithDuration(file);
      if (!result.ok) {
        onError?.(result.error);
        return;
      }
      onVideoChange(file);
    } catch {
      onError?.("无法处理视频文件");
    } finally {
      setValidating(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const videoSizeLabel =
    video instanceof File
      ? `${(video.size / (1024 * 1024)).toFixed(1)}MB / 上限 ${MAX_VIDEO_SIZE_MB}MB`
      : null;

  const handleRemove = () => {
    if (video instanceof File) {
      revokeVideoPreviewUrl(video);
    }
    onVideoChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#1f2933]">看房短视频</p>
          <p className="text-xs text-[#5a6b73] mt-0.5">
            可选 · 小于{MAX_VIDEO_SIZE_MB}MB · MP4 / MOV · 封面请用上方照片
          </p>
          {videoSizeLabel && (
            <p className="text-xs text-[#2f9e6d] mt-1 font-medium">
              当前视频：{videoSizeLabel}
            </p>
          )}
        </div>
        {hasVideo && !validating && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isBusy}
            className="text-xs text-[#d94a38] font-medium hover:underline disabled:opacity-50"
          >
            移除视频
          </button>
        )}
      </div>

      {validating ? (
        <div className="w-full aspect-video rounded-2xl border border-[rgba(31,41,51,0.08)] bg-[#eef2f4] flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="md" />
          <p className="text-sm font-medium text-[#1f2933]">正在检查视频...</p>
          <p className="text-xs text-[#5a6b73]">读取时长与格式，请稍候</p>
        </div>
      ) : showVideoPlayer ? (
        <div className="relative rounded-2xl overflow-hidden border border-[rgba(31,41,51,0.08)] bg-black aspect-video">
          {!previewReady && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#eef2f4]">
              <LoadingSpinner size="md" />
              <span className="text-xs text-[#5a6b73] font-medium">
                视频加载中...
              </span>
            </div>
          )}
          <video
            ref={handleVideoRef}
            key={videoSrc}
            src={videoSrc}
            controls
            playsInline
            preload="metadata"
            className={`w-full h-full object-contain transition-opacity duration-200 ${
              previewReady ? "opacity-100" : "opacity-0"
            }`}
            onLoadedData={markPreviewReady}
            onLoadedMetadata={markPreviewReady}
            onCanPlay={markPreviewReady}
            onError={() => {
              markPreviewReady();
              onError?.("视频预览失败，请换一段视频试试");
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isBusy}
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-[rgba(47,158,109,0.35)] bg-[#f3fbf7] flex flex-col items-center justify-center gap-2 hover:border-[#2f9e6d] hover:bg-white transition-colors disabled:opacity-50"
        >
          <span className="text-3xl">🎬</span>
          <span className="text-sm font-bold text-[#2f9e6d]">上传看房视频</span>
          <span className="text-xs text-[#5a6b73]">租客点进详情页后可观看</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/quicktime,video/*"
        className="hidden"
        onChange={(e) => handlePick(e.target.files)}
        disabled={isBusy}
      />
    </div>
  );
}
