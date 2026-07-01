import { useEffect, useState, type RefObject } from "react";

export type VideoElementLayout = {
  isPortrait: boolean;
  ready: boolean;
};

function readVideoLayout(video: HTMLVideoElement): VideoElementLayout | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;

  return {
    isPortrait: h > w,
    ready: true,
  };
}

export function useVideoElementLayout(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
): VideoElementLayout {
  const [layout, setLayout] = useState<VideoElementLayout>({
    isPortrait: false,
    ready: false,
  });

  useEffect(() => {
    if (!enabled) return;

    const video = videoRef.current;
    if (!video) return;

    const update = () => {
      const next = readVideoLayout(video);
      if (next) setLayout(next);
    };

    video.addEventListener("loadedmetadata", update);
    video.addEventListener("resize", update);
    update();

    return () => {
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("resize", update);
    };
  }, [enabled, videoRef]);

  if (!enabled) {
    return { isPortrait: false, ready: false };
  }

  return layout;
}

export function getVideoPresentationClass(
  layout: VideoElementLayout,
  role: "main" | "pip",
): string {
  if (role === "main") {
    if (layout.ready && layout.isPortrait) {
      return "absolute inset-0 h-full w-full object-contain";
    }
    return "absolute inset-0 h-full w-full object-cover";
  }

  return "h-full w-full object-cover";
}
