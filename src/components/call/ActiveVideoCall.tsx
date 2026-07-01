"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  RoomEvent,
  Track,
  type LocalTrackPublication,
  type RemoteTrack,
  type Room,
} from "livekit-client";
import { formatCallDuration } from "@/lib/calls/livekit";
import { getOutgoingStatusLabel } from "@/lib/calls/messages";
import {
  getCameraFlipLabel,
  shouldMirrorLocalVideo,
  type CameraFacing,
} from "@/lib/calls/camera";
import {
  getVideoPresentationClass,
  useVideoElementLayout,
} from "@/lib/calls/videoLayout";
import type { CallMode } from "@/lib/calls/types";
import CallWaveAvatar from "@/components/call/CallWaveAvatar";
import { DURATION, EASE } from "@/lib/motion/tokens";

type Props = {
  open: boolean;
  peerName: string;
  callMode: CallMode;
  startedAtMs: number | null;
  isMuted: boolean;
  isCameraOff: boolean;
  cameraFacing: CameraFacing;
  canFlipCamera: boolean;
  audioBlocked?: boolean;
  roomRef: RefObject<Room | null>;
  onUnlockAudio?: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onFlipCamera: () => void;
  onEnd: () => void;
  ending?: boolean;
};

function useTickingNow(enabled: boolean): number {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (!enabled) return () => {};
      const id = window.setInterval(onStoreChange, 1000);
      return () => window.clearInterval(id);
    },
    () => (enabled ? Date.now() : 0),
    () => 0,
  );
}

export default function ActiveVideoCall({
  open,
  peerName,
  callMode,
  startedAtMs,
  isMuted,
  isCameraOff,
  cameraFacing,
  canFlipCamera,
  audioBlocked,
  roomRef,
  onUnlockAudio,
  onToggleMute,
  onToggleCamera,
  onFlipCamera,
  onEnd,
  ending,
}: Props) {
  const mirrorLocal = shouldMirrorLocalVideo(cameraFacing);
  const reducedMotion = useReducedMotion();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const ticking = open && startedAtMs != null;
  const nowMs = useTickingNow(ticking);
  const elapsedSec =
    startedAtMs != null
      ? Math.max(0, Math.floor((nowMs - startedAtMs) / 1000))
      : 0;
  const statusLabel = startedAtMs
    ? formatCallDuration(elapsedSec)
    : getOutgoingStatusLabel(callMode, startedAtMs);
  const showVideoLayout = startedAtMs != null;
  const remoteLayout = useVideoElementLayout(remoteVideoRef, showVideoLayout);
  const localLayout = useVideoElementLayout(
    localVideoRef,
    showVideoLayout && !isCameraOff,
  );

  useEffect(() => {
    if (!open) return;
    const room = roomRef.current;
    if (!room) return;

    const attachLocalVideo = () => {
      const el = localVideoRef.current;
      if (!el || isCameraOff) return;
      const pub = room.localParticipant.getTrackPublication(
        Track.Source.Camera,
      );
      if (pub?.track) {
        pub.track.attach(el);
        el.dispatchEvent(new Event("resize"));
      }
    };

    const detachLocalVideo = () => {
      const el = localVideoRef.current;
      if (!el) return;
      const pub = room.localParticipant.getTrackPublication(
        Track.Source.Camera,
      );
      pub?.track?.detach(el);
    };

    const attachRemoteVideo = (track: RemoteTrack) => {
      if (track.kind !== Track.Kind.Video || !remoteVideoRef.current) return;
      track.attach(remoteVideoRef.current);
      remoteVideoRef.current.dispatchEvent(new Event("resize"));
    };

    const onTrackSubscribed = (track: RemoteTrack) => {
      attachRemoteVideo(track);
    };

    const onTrackUnsubscribed = (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Video) {
        track.detach();
      }
    };

    const onLocalPublished = (_pub: LocalTrackPublication) => {
      attachLocalVideo();
    };

    const onLocalUnpublished = () => {
      detachLocalVideo();
    };

    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    room.on(RoomEvent.LocalTrackPublished, onLocalPublished);
    room.on(RoomEvent.LocalTrackUnpublished, onLocalUnpublished);

    for (const participant of room.remoteParticipants.values()) {
      for (const pub of participant.videoTrackPublications.values()) {
        if (pub.track) attachRemoteVideo(pub.track);
      }
    }
    const remoteEl = remoteVideoRef.current;
    attachLocalVideo();

    return () => {
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
      room.off(RoomEvent.LocalTrackPublished, onLocalPublished);
      room.off(RoomEvent.LocalTrackUnpublished, onLocalUnpublished);
      detachLocalVideo();
      if (remoteEl) {
        room.remoteParticipants.forEach((p) => {
          p.videoTrackPublications.forEach((pub) => {
            pub.track?.detach(remoteEl);
          });
        });
      }
    };
  }, [open, isCameraOff, cameraFacing, roomRef, startedAtMs]);

  if (typeof document === "undefined") return null;

  const remoteVideoClass = getVideoPresentationClass(remoteLayout, "main");
  const localVideoClass = `${getVideoPresentationClass(localLayout, "pip")} ${mirrorLocal ? "scale-x-[-1]" : ""}`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col bg-black text-white"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: DURATION.normal, ease: EASE.out }}
        >
          {showVideoLayout ? (
            <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
              <video
                ref={remoteVideoRef}
                className={remoteVideoClass}
                autoPlay
                playsInline
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/60 to-transparent px-4 pb-8 pt-12">
                <p className="text-lg font-bold">{peerName}</p>
                <p className="text-sm text-white/80">{statusLabel}</p>
              </div>
              <div
                className={`absolute bottom-24 right-4 z-10 h-36 w-28 overflow-hidden rounded-2xl border-2 border-white/30 bg-[#1f2933] shadow-xl ${
                  isCameraOff ? "hidden" : ""
                }`}
              >
                <video
                  ref={localVideoRef}
                  className={localVideoClass}
                  autoPlay
                  playsInline
                  muted
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6">
              <CallWaveAvatar
                name={peerName}
                variant="connecting"
                theme="dark"
                size="lg"
              />
              <p className="mt-6 text-xl font-bold">{peerName}</p>
              <p className="mt-1 text-sm text-white/70">{statusLabel}</p>
            </div>
          )}

          {audioBlocked && onUnlockAudio && (
            <div className="absolute left-0 right-0 top-1/2 z-20 flex justify-center">
              <button
                type="button"
                onClick={onUnlockAudio}
                className="rounded-full bg-[#2f9e6d] px-4 py-2 text-sm font-semibold"
              >
                点击启用声音
              </button>
            </div>
          )}

          <div className="flex shrink-0 items-center justify-center gap-4 bg-black/80 px-4 py-8 pb-10 sm:gap-6 sm:px-6">
            {canFlipCamera && (
              <button
                type="button"
                onClick={onFlipCamera}
                disabled={ending || !startedAtMs || isCameraOff}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xl transition-colors hover:bg-white/25 disabled:opacity-40"
                aria-label={getCameraFlipLabel(cameraFacing)}
                title={getCameraFlipLabel(cameraFacing)}
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={onToggleCamera}
              disabled={ending || !startedAtMs}
              className={`flex h-14 w-14 items-center justify-center rounded-full text-xl transition-colors disabled:opacity-40 ${
                isCameraOff
                  ? "bg-white text-[#1f2933]"
                  : "bg-white/15 hover:bg-white/25"
              }`}
              aria-label={isCameraOff ? "开启摄像头" : "关闭摄像头"}
            >
              {isCameraOff ? <img src="/camera-off-svgrepo-com.svg" /> : "🎥"}
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              disabled={ending || !startedAtMs}
              className={`flex h-14 w-14 items-center justify-center rounded-full text-xl transition-colors disabled:opacity-40 ${
                isMuted
                  ? "bg-white text-[#1f2933]"
                  : "bg-white/15 hover:bg-white/25"
              }`}
              aria-label={isMuted ? "取消静音" : "静音"}
            >
              {isMuted ? "🔇" : "🎙️"}
            </button>
            <button
              type="button"
              onClick={onEnd}
              disabled={ending}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d94a38] text-2xl hover:bg-[#c43f2f] disabled:opacity-60"
              aria-label="挂断"
            >
              📞
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
