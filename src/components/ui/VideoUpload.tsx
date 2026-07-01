"use client";

import { useRef, useState } from "react";
import { validateVideoFileWithDuration } from "@/lib/video/validateVideo";
import { MAX_VIDEO_DURATION_SEC } from "@/lib/video/constants";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const hasVideo = !!video;

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
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      onVideoChange(file);
    } catch {
      onError?.("无法处理视频文件");
    } finally {
      setValidating(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onVideoChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#1f2933]">看房短视频</p>
          <p className="text-xs text-[#5a6b73] mt-0.5">
            可选 · 最长 {MAX_VIDEO_DURATION_SEC} 秒 · MP4 / MOV ·
            列表封面请用上方照片
          </p>
        </div>
        {hasVideo && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || validating}
            className="text-xs text-[#d94a38] font-medium hover:underline disabled:opacity-50"
          >
            移除视频
          </button>
        )}
      </div>

      {hasVideo ? (
        <div className="relative rounded-2xl overflow-hidden border border-[rgba(31,41,51,0.08)] bg-black aspect-video">
          {typeof video === "string" ? (
            <video
              src={video}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              src={previewUrl || undefined}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || validating}
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-[rgba(47,158,109,0.35)] bg-[#f3fbf7] flex flex-col items-center justify-center gap-2 hover:border-[#2f9e6d] hover:bg-white transition-colors disabled:opacity-50"
        >
          <span className="text-3xl">🎬</span>
          <span className="text-sm font-bold text-[#2f9e6d]">
            {validating ? "正在检查视频..." : "上传看房视频"}
          </span>
          <span className="text-xs text-[#5a6b73]">租客点进详情页后可观看</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/quicktime,video/*"
        className="hidden"
        onChange={(e) => handlePick(e.target.files)}
      />
    </div>
  );
}
