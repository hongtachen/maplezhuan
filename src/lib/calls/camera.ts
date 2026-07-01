import {
  Room,
  Track,
  facingModeFromLocalTrack,
  type LocalVideoTrack,
  type Room as LiveKitRoom,
  type VideoCaptureOptions,
} from "livekit-client";

export type CameraFacing = "user" | "environment";

const MOBILE_LONG_SIDE = 1280;
const MOBILE_SHORT_SIDE = 720;

export function isMobileLikeDevice(): boolean {
  if (typeof window === "undefined") return false;
  const mobileUa = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrowScreen = window.matchMedia("(max-width: 768px)").matches;
  return mobileUa || (coarsePointer && narrowScreen);
}

/** Whether the device is currently held in portrait. */
export function isDevicePortrait(): boolean {
  if (typeof window === "undefined") return true;
  if (screen.orientation?.type) {
    return screen.orientation.type.startsWith("portrait");
  }
  return window.innerHeight >= window.innerWidth;
}

function getOrientationResolution(portrait: boolean): {
  width: number;
  height: number;
} {
  return portrait
    ? { width: MOBILE_SHORT_SIDE, height: MOBILE_LONG_SIDE }
    : { width: MOBILE_LONG_SIDE, height: MOBILE_SHORT_SIDE };
}

export function getRoomVideoCaptureDefaults(): VideoCaptureOptions {
  if (isMobileLikeDevice()) {
    return { resolution: getOrientationResolution(isDevicePortrait()) };
  }
  return { resolution: { width: 1280, height: 720 } };
}

export function getVideoCaptureOptions(
  facing: CameraFacing,
): VideoCaptureOptions {
  if (isMobileLikeDevice()) {
    const portrait = isDevicePortrait();
    const { width, height } = getOrientationResolution(portrait);
    return {
      facingMode: facing,
      resolution: {
        width,
        height,
        aspectRatio: portrait ? 9 / 16 : 16 / 9,
      },
    };
  }
  return {
    facingMode: facing,
    resolution: { width: 1280, height: 720 },
  };
}

export async function syncLocalCameraOrientation(
  room: LiveKitRoom,
  facing: CameraFacing,
): Promise<void> {
  const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
  const videoTrack = pub?.videoTrack as LocalVideoTrack | undefined;
  if (!videoTrack || pub?.isMuted) return;
  await videoTrack.restartTrack(getVideoCaptureOptions(facing));
}

export function shouldMirrorLocalVideo(facing: CameraFacing): boolean {
  return facing === "user";
}

export function getLocalCameraFacing(room: LiveKitRoom): CameraFacing {
  const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
  const track = pub?.videoTrack;
  if (!track) return "user";
  const { facingMode } = facingModeFromLocalTrack(track);
  return facingMode === "environment" ? "environment" : "user";
}

export async function canFlipLocalCamera(): Promise<boolean> {
  if (isMobileLikeDevice()) return true;
  try {
    const devices = await Room.getLocalDevices("videoinput");
    return devices.length > 1;
  } catch {
    return false;
  }
}

async function flipByFacingMode(room: LiveKitRoom): Promise<CameraFacing> {
  const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
  const videoTrack = pub?.videoTrack as LocalVideoTrack | undefined;

  if (!videoTrack) {
    await room.localParticipant.setCameraEnabled(
      true,
      getVideoCaptureOptions("environment"),
    );
    return "environment";
  }

  const current = getLocalCameraFacing(room);
  const next: CameraFacing = current === "user" ? "environment" : "user";
  await videoTrack.restartTrack(getVideoCaptureOptions(next));
  return next;
}

async function flipByDeviceId(room: LiveKitRoom): Promise<CameraFacing> {
  const devices = await Room.getLocalDevices("videoinput");
  if (devices.length <= 1) {
    return flipByFacingMode(room);
  }

  const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
  const currentDeviceId =
    pub?.videoTrack?.mediaStreamTrack?.getSettings().deviceId ?? "";

  const currentIndex = devices.findIndex((d) => d.deviceId === currentDeviceId);
  const nextDevice =
    devices[(currentIndex + 1 + devices.length) % devices.length]!;

  await room.switchActiveDevice("videoinput", nextDevice.deviceId, true);

  const pubAfter = room.localParticipant.getTrackPublication(
    Track.Source.Camera,
  );
  if (pubAfter?.videoTrack) {
    const { facingMode } = facingModeFromLocalTrack(pubAfter.videoTrack);
    return facingMode === "environment" ? "environment" : "user";
  }
  return "user";
}

export async function flipLocalCamera(
  room: LiveKitRoom,
): Promise<CameraFacing> {
  if (isMobileLikeDevice()) {
    return flipByFacingMode(room);
  }
  return flipByDeviceId(room);
}

export function getCameraFlipLabel(facing: CameraFacing): string {
  return facing === "user" ? "切换后置镜头" : "切换前置镜头";
}

export function subscribeDeviceOrientation(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("orientationchange", onChange);
  screen.orientation?.addEventListener("change", onChange);

  return () => {
    window.removeEventListener("orientationchange", onChange);
    screen.orientation?.removeEventListener("change", onChange);
  };
}
