export type CallStatus =
  | "ringing"
  | "active"
  | "ended"
  | "missed"
  | "declined"
  | "cancelled";

export type CallDocument = {
  id?: string;
  chatId: string;
  roomName: string;
  callerId: string;
  calleeId: string;
  callerName?: string;
  calleeName?: string;
  status: CallStatus;
  itemId?: string;
  itemType?: "item" | "sublet";
  startedAt?: { seconds: number };
  endedAt?: { seconds: number };
  createdAt?: { seconds: number };
  durationSec?: number;
};

export type StartVoiceCallParams = {
  chatId: string;
  calleeId: string;
  calleeName?: string;
  itemId?: string;
  itemType?: "item" | "sublet";
};
