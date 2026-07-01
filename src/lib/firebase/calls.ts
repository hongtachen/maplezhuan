import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "./config";
import type { CallDocument, CallStatus } from "@/lib/calls/types";
import type { CallChatMsgType } from "@/lib/calls/messages";

export async function createVoiceCall(params: {
  chatId: string;
  callerId: string;
  calleeId: string;
  callerName?: string;
  calleeName?: string;
  itemId?: string;
  itemType?: "item" | "sublet";
}): Promise<{ callId: string; roomName: string }> {
  const callRef = doc(collection(db, "calls"));
  const roomName = `call-${callRef.id}`;

  await setDoc(callRef, {
    chatId: params.chatId,
    roomName,
    callerId: params.callerId,
    calleeId: params.calleeId,
    callerName: params.callerName || "",
    calleeName: params.calleeName || "",
    itemId: params.itemId || null,
    itemType: params.itemType || null,
    status: "ringing" satisfies CallStatus,
    createdAt: serverTimestamp(),
  });

  return { callId: callRef.id, roomName };
}

export async function updateCallStatus(
  callId: string,
  status: CallStatus,
  extra?: Partial<Pick<CallDocument, "durationSec">>,
): Promise<void> {
  const payload: Record<string, unknown> = { status };

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined) {
        payload[key] = value;
      }
    }
  }

  if (status === "active") {
    payload.startedAt = serverTimestamp();
  }
  if (
    status === "ended" ||
    status === "missed" ||
    status === "declined" ||
    status === "cancelled"
  ) {
    payload.endedAt = serverTimestamp();
  }
  await updateDoc(doc(db, "calls", callId), payload);
}

export async function addCallChatMessage(params: {
  chatId: string;
  senderId: string;
  msgType: CallChatMsgType;
  text: string;
  callId: string;
  durationSec?: number;
}): Promise<void> {
  await addDoc(collection(db, "messages"), {
    chatId: params.chatId,
    senderId: params.senderId,
    text: params.text,
    msgType: params.msgType,
    metadata: {
      callId: params.callId,
      ...(params.durationSec != null
        ? { callDurationSec: params.durationSec }
        : {}),
    },
    createdAt: serverTimestamp(),
  });
}
