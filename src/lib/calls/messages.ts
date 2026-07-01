import { formatCallDuration } from "./livekit";
import type { CallMode } from "./types";

export type CallChatMsgType =
  | "call_invite"
  | "call_ended"
  | "call_missed"
  | "call_declined"
  | "call_cancelled";

function resolveCallMode(mode?: CallMode): CallMode {
  return mode === "video" ? "video" : "voice";
}

/** Text shown in the chat bubble — depends on who is reading. */
export function formatCallMessageForViewer(
  msgType: CallChatMsgType,
  isSender: boolean,
  options?: { durationSec?: number; callMode?: CallMode },
): string {
  const mode = resolveCallMode(options?.callMode);
  const isVideo = mode === "video";

  switch (msgType) {
    case "call_invite":
      return isSender
        ? isVideo
          ? "发起了视频看房"
          : "发起了语音通话"
        : isVideo
          ? "对方发起了视频看房"
          : "对方发起了语音通话";
    case "call_missed":
      return isSender
        ? isVideo
          ? "对方未接听视频看房"
          : "对方未接听"
        : isVideo
          ? "未接视频看房"
          : "未接来电";
    case "call_declined":
      return isSender
        ? isVideo
          ? "已拒绝视频看房"
          : "已拒绝通话"
        : isVideo
          ? "对方已拒绝视频看房"
          : "对方已拒绝";
    case "call_cancelled":
      return isSender
        ? isVideo
          ? "已取消视频看房"
          : "已取消通话"
        : isVideo
          ? "对方已取消视频看房"
          : "对方已取消通话";
    case "call_ended":
      if (options?.durationSec != null) {
        return isVideo
          ? `视频看房结束 · ${formatCallDuration(options.durationSec)}`
          : `通话结束 · ${formatCallDuration(options.durationSec)}`;
      }
      return isVideo ? "视频看房已结束" : "通话已结束";
  }
}

/** Neutral preview for the messages list (shared lastMessage field). */
export function getCallChatListPreview(
  msgType: CallChatMsgType,
  options?: { durationSec?: number; callMode?: CallMode },
): string {
  const mode = resolveCallMode(options?.callMode);
  const isVideo = mode === "video";

  switch (msgType) {
    case "call_invite":
      return isVideo ? "[视频看房]" : "[语音通话]";
    case "call_missed":
      return isVideo ? "未接视频看房" : "未接来电";
    case "call_declined":
      return isVideo ? "视频看房已拒绝" : "通话已拒绝";
    case "call_cancelled":
      return isVideo ? "视频看房已取消" : "通话已取消";
    case "call_ended":
      return options?.durationSec != null
        ? isVideo
          ? `视频看房结束 · ${formatCallDuration(options.durationSec)}`
          : `通话结束 · ${formatCallDuration(options.durationSec)}`
        : isVideo
          ? "视频看房已结束"
          : "通话已结束";
  }
}

export function isTerminalCallStatus(status: string): boolean {
  return ["ended", "missed", "declined", "cancelled"].includes(status);
}

export function getCallSystemMessage(
  status: "ended" | "missed" | "declined" | "cancelled",
  options: { durationSec?: number; callMode?: CallMode },
): { msgType: CallChatMsgType; text: string } {
  const msgType: CallChatMsgType =
    status === "ended"
      ? "call_ended"
      : status === "missed"
        ? "call_missed"
        : status === "declined"
          ? "call_declined"
          : "call_cancelled";

  return {
    msgType,
    text: formatCallMessageForViewer(msgType, true, options),
  };
}

export function getIncomingCallSubtitle(callMode?: CallMode): string {
  return resolveCallMode(callMode) === "video" ? "视频看房来电" : "语音来电";
}

export function getOutgoingStatusLabel(
  callMode: CallMode | undefined,
  startedAtMs: number | null,
): string {
  if (startedAtMs) return "";
  return resolveCallMode(callMode) === "video"
    ? "正在发起视频看房…"
    : "正在呼叫…";
}
