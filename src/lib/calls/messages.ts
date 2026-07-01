import { formatCallDuration } from "./livekit";

export type CallChatMsgType =
  | "call_invite"
  | "call_ended"
  | "call_missed"
  | "call_declined"
  | "call_cancelled";

/** Text shown in the chat bubble — depends on who is reading. */
export function formatCallMessageForViewer(
  msgType: CallChatMsgType,
  isSender: boolean,
  options?: { durationSec?: number },
): string {
  switch (msgType) {
    case "call_invite":
      return isSender ? "发起了语音通话" : "对方发起了语音通话";
    case "call_missed":
      return isSender ? "对方未接听" : "未接来电";
    case "call_declined":
      return isSender ? "已拒绝通话" : "对方已拒绝";
    case "call_cancelled":
      return isSender ? "已取消通话" : "对方已取消通话";
    case "call_ended":
      return options?.durationSec != null
        ? `通话结束 · ${formatCallDuration(options.durationSec)}`
        : "通话已结束";
  }
}

/** Neutral preview for the messages list (shared lastMessage field). */
export function getCallChatListPreview(
  msgType: CallChatMsgType,
  durationSec?: number,
): string {
  switch (msgType) {
    case "call_invite":
      return "[语音通话]";
    case "call_missed":
      return "未接来电";
    case "call_declined":
      return "通话已拒绝";
    case "call_cancelled":
      return "通话已取消";
    case "call_ended":
      return durationSec != null
        ? `通话结束 · ${formatCallDuration(durationSec)}`
        : "通话已结束";
  }
}

export function isTerminalCallStatus(status: string): boolean {
  return ["ended", "missed", "declined", "cancelled"].includes(status);
}

export function getCallSystemMessage(
  status: "ended" | "missed" | "declined" | "cancelled",
  options: { durationSec?: number },
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
    text: formatCallMessageForViewer(msgType, true, {
      durationSec: options.durationSec,
    }),
  };
}
