"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { Room, RoomEvent } from "livekit-client";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/store/useAuthStore";
import { useApp } from "@/components/app/AppContext";
import type {
  CallDocument,
  CallMode,
  CallStatus,
  StartCallParams,
} from "@/lib/calls/types";
import {
  formatCallMessageForViewer,
  getCallChatListPreview,
  getCallSystemMessage,
  isTerminalCallStatus,
} from "@/lib/calls/messages";
import {
  addCallChatMessage,
  createCall,
  updateCallStatus,
} from "@/lib/firebase/calls";
import { fetchLiveKitToken } from "@/lib/calls/livekit";
import { setupRoomAudio, unlockRoomAudio } from "@/lib/calls/roomAudio";
import {
  canFlipLocalCamera,
  flipLocalCamera,
  getLocalCameraFacing,
  getRoomVideoCaptureDefaults,
  getVideoCaptureOptions,
  subscribeDeviceOrientation,
  syncLocalCameraOrientation,
  type CameraFacing,
} from "@/lib/calls/camera";
import IncomingCallOverlay from "@/components/call/IncomingCallOverlay";
import ActiveVoiceCall from "@/components/call/ActiveVoiceCall";
import ActiveVideoCall from "@/components/call/ActiveVideoCall";

const RING_TIMEOUT_MS = 30_000;

type CallPhase = "idle" | "outgoing" | "incoming" | "active";

type CallContextValue = {
  phase: CallPhase;
  startVoiceCall: (params: StartCallParams) => Promise<void>;
  startVideoCall: (params: StartCallParams) => Promise<void>;
  isInCall: boolean;
};

const CallContext = createContext<CallContextValue | null>(null);

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCall must be used within CallProvider");
  }
  return ctx;
}

function mapCallDoc(id: string, data: Record<string, unknown>): CallDocument {
  return { id, ...(data as Omit<CallDocument, "id">) };
}

export default function CallProvider({ children }: { children: ReactNode }) {
  const { user, userProfile } = useAuthStore();
  const { showToast } = useApp();

  const [phase, setPhase] = useState<CallPhase>("idle");
  const [incomingCall, setIncomingCall] = useState<CallDocument | null>(null);
  const [activeCall, setActiveCall] = useState<CallDocument | null>(null);
  const [peerName, setPeerName] = useState("");
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("user");
  const [canFlipCamera, setCanFlipCamera] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [busy, setBusy] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const roomAudioCleanupRef = useRef<(() => void) | null>(null);
  const ringTimerRef = useRef<number | null>(null);
  const phaseRef = useRef<CallPhase>("idle");
  const finalizedCallIdsRef = useRef<Set<string>>(new Set());
  const [watchedCallId, setWatchedCallId] = useState<string | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearRingTimer = useCallback(() => {
    if (ringTimerRef.current != null) {
      window.clearTimeout(ringTimerRef.current);
      ringTimerRef.current = null;
    }
  }, []);

  const resetCallState = useCallback(() => {
    setPhase("idle");
    setIncomingCall(null);
    setActiveCall(null);
    setPeerName("");
    setStartedAtMs(null);
    setWatchedCallId(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setCameraFacing("user");
    setCanFlipCamera(false);
    setAudioBlocked(false);
  }, []);

  const disconnectRoom = useCallback(async () => {
    roomAudioCleanupRef.current?.();
    roomAudioCleanupRef.current = null;
    const room = roomRef.current;
    roomRef.current = null;
    if (room) {
      room.removeAllListeners();
      await room.disconnect();
    }
    setAudioBlocked(false);
  }, []);

  const bumpChatLastMessage = useCallback(
    async (chatId: string, text: string, recipientId: string) => {
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        [`unreadCounts.${recipientId}`]: increment(1),
        hiddenBy: [],
      });
    },
    [],
  );

  const connectRoom = useCallback(
    async (callId: string, callMode: CallMode) => {
      const { token, url } = await fetchLiveKitToken(callId);
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: getRoomVideoCaptureDefaults(),
      });
      roomRef.current = room;

      room.on(RoomEvent.Disconnected, () => {
        if (roomRef.current === room) {
          roomRef.current = null;
        }
      });

      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        setAudioBlocked(!room.canPlaybackAudio);
      });

      roomAudioCleanupRef.current = setupRoomAudio(room);

      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsMuted(false);

      if (callMode === "video") {
        await room.localParticipant.setCameraEnabled(
          true,
          getVideoCaptureOptions("user"),
        );
        setIsCameraOff(false);
        setCameraFacing("user");
        void canFlipLocalCamera().then(setCanFlipCamera);
      }

      try {
        await unlockRoomAudio(room);
        setAudioBlocked(!room.canPlaybackAudio);
      } catch {
        setAudioBlocked(true);
      }
    },
    [],
  );

  const finalizeCall = useCallback(
    async (
      call: CallDocument,
      status: "ended" | "missed" | "declined" | "cancelled",
      options?: { notifyMessage?: boolean; durationSec?: number },
    ) => {
      if (!call.id || finalizedCallIdsRef.current.has(call.id)) return;

      clearRingTimer();

      const snap = await getDoc(doc(db, "calls", call.id));
      const currentStatus = snap.data()?.status as CallStatus | undefined;

      if (currentStatus && isTerminalCallStatus(currentStatus)) {
        resetCallState();
        return;
      }

      // Ring-timeout / cancel only apply while still ringing (ignore stale 30s timer).
      if (
        (status === "missed" ||
          status === "cancelled" ||
          status === "declined") &&
        currentStatus &&
        currentStatus !== "ringing"
      ) {
        return;
      }

      if (status === "ended" && currentStatus !== "active") {
        return;
      }

      finalizedCallIdsRef.current.add(call.id);
      await disconnectRoom();

      await updateCallStatus(call.id, status, {
        durationSec: options?.durationSec,
      });

      const isCaller = user?.uid === call.callerId;
      const otherUserId = isCaller ? call.calleeId : call.callerId;
      const shouldNotify = options?.notifyMessage !== false;

      if (shouldNotify && user) {
        const callMode = call.callMode ?? "voice";
        const { msgType, text } = getCallSystemMessage(status, {
          durationSec: options?.durationSec,
          callMode,
        });

        await addCallChatMessage({
          chatId: call.chatId,
          senderId: user.uid,
          msgType,
          text,
          callId: call.id,
          callMode,
          durationSec: options?.durationSec,
        });
        await bumpChatLastMessage(
          call.chatId,
          getCallChatListPreview(msgType, {
            durationSec: options?.durationSec,
            callMode,
          }),
          otherUserId,
        );
      }

      resetCallState();
    },
    [bumpChatLastMessage, clearRingTimer, disconnectRoom, resetCallState, user],
  );

  const dismissIncomingCall = useCallback(
    (status: CallStatus) => {
      if (phaseRef.current !== "incoming") return;
      if (status === "cancelled") {
        showToast("对方已取消", "info");
      } else if (status === "missed") {
        showToast("未接来电", "info");
      }
      resetCallState();
    },
    [resetCallState, showToast],
  );

  const endActiveCall = useCallback(async () => {
    const call = activeCall;
    if (!call?.id || busy) return;
    setBusy(true);
    try {
      const durationSec = startedAtMs
        ? Math.max(1, Math.floor((Date.now() - startedAtMs) / 1000))
        : undefined;
      await finalizeCall(call, "ended", { durationSec });
    } catch (e) {
      console.error(e);
      showToast("挂断失败", "error");
    } finally {
      setBusy(false);
    }
  }, [activeCall, busy, finalizeCall, showToast, startedAtMs]);

  const acceptIncoming = useCallback(async () => {
    const call = incomingCall;
    if (!call?.id || !user || busy) return;
    setBusy(true);
    try {
      const snap = await getDoc(doc(db, "calls", call.id));
      if (!snap.exists() || snap.data()?.status !== "ringing") {
        resetCallState();
        showToast("通话已结束", "info");
        return;
      }

      await updateCallStatus(call.id, "active");
      const callMode = call.callMode ?? "voice";
      await connectRoom(call.id, callMode);
      setIncomingCall(null);
      setActiveCall({ ...call, status: "active" });
      setPeerName(call.callerName || "对方");
      setStartedAtMs(Date.now());
      setPhase("active");
      setWatchedCallId(call.id);
      clearRingTimer();
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : "接听失败", "error");
      resetCallState();
      await disconnectRoom();
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    clearRingTimer,
    connectRoom,
    disconnectRoom,
    incomingCall,
    resetCallState,
    showToast,
    user,
  ]);

  const declineIncoming = useCallback(async () => {
    const call = incomingCall;
    if (!call?.id || busy) return;
    setBusy(true);
    try {
      await finalizeCall(call, "declined");
    } finally {
      setBusy(false);
    }
  }, [busy, finalizeCall, incomingCall]);

  const cancelOutgoingCall = useCallback(async () => {
    const call = activeCall;
    if (!call?.id || busy) return;
    setBusy(true);
    try {
      await finalizeCall(call, "cancelled");
    } catch (e) {
      console.error(e);
      showToast("取消失败", "error");
    } finally {
      setBusy(false);
    }
  }, [activeCall, busy, finalizeCall, showToast]);

  const startCall = useCallback(
    async (params: StartCallParams, callMode: CallMode) => {
      if (!user || busy) return;
      if (phase !== "idle") {
        showToast("当前已有通话进行中", "info");
        return;
      }

      if (callMode === "video" && params.itemType !== "sublet") {
        showToast("视频看房仅支持转租对话", "info");
        return;
      }

      setBusy(true);
      try {
        const { callId } = await createCall({
          chatId: params.chatId,
          callerId: user.uid,
          calleeId: params.calleeId,
          callerName: userProfile?.nickname || user.displayName || "用户",
          calleeName: params.calleeName,
          callMode,
          itemId: params.itemId,
          itemType: params.itemType,
        });

        const inviteText = formatCallMessageForViewer("call_invite", true, {
          callMode,
        });
        await addCallChatMessage({
          chatId: params.chatId,
          senderId: user.uid,
          msgType: "call_invite",
          text: inviteText,
          callId,
          callMode,
        });
        await bumpChatLastMessage(
          params.chatId,
          getCallChatListPreview("call_invite", { callMode }),
          params.calleeId,
        );

        const call: CallDocument = {
          id: callId,
          chatId: params.chatId,
          roomName: `call-${callId}`,
          callerId: user.uid,
          calleeId: params.calleeId,
          callerName: userProfile?.nickname,
          calleeName: params.calleeName,
          callMode,
          status: "ringing",
          itemId: params.itemId,
          itemType: params.itemType,
        };

        setActiveCall(call);
        setPeerName(params.calleeName || "对方");
        setPhase("outgoing");
        setWatchedCallId(callId);

        await connectRoom(callId, callMode);

        ringTimerRef.current = window.setTimeout(() => {
          if (phaseRef.current !== "outgoing") return;
          void finalizeCall(call, "missed");
        }, RING_TIMEOUT_MS);
      } catch (e) {
        console.error(e);
        showToast(e instanceof Error ? e.message : "无法发起通话", "error");
        resetCallState();
        await disconnectRoom();
      } finally {
        setBusy(false);
      }
    },
    [
      bumpChatLastMessage,
      busy,
      connectRoom,
      disconnectRoom,
      finalizeCall,
      phase,
      resetCallState,
      showToast,
      user,
      userProfile,
    ],
  );

  const startVoiceCall = useCallback(
    (params: StartCallParams) => startCall(params, "voice"),
    [startCall],
  );

  const startVideoCall = useCallback(
    (params: StartCallParams) => startCall(params, "video"),
    [startCall],
  );

  // Discover new incoming ringing calls (idle only).
  useEffect(() => {
    if (!user?.uid || phase !== "idle") return;

    const q = query(
      collection(db, "calls"),
      where("calleeId", "==", user.uid),
      where("status", "==", "ringing"),
    );

    return onSnapshot(q, (snap) => {
      if (phaseRef.current !== "idle") return;
      const docSnap = snap.docs[0];
      if (!docSnap) return;
      const call = mapCallDoc(docSnap.id, docSnap.data());
      setIncomingCall(call);
      setPhase("incoming");
    });
  }, [user?.uid, phase]);

  // Dismiss incoming UI when caller cancels, times out, or call ends remotely.
  useEffect(() => {
    if (!incomingCall?.id) return;

    return onSnapshot(doc(db, "calls", incomingCall.id), (snap) => {
      if (!snap.exists()) {
        dismissIncomingCall("cancelled");
        return;
      }
      const call = mapCallDoc(snap.id, snap.data());
      if (call.status === "active") {
        if (phaseRef.current === "incoming" && !busy) {
          resetCallState();
        }
        return;
      }
      if (isTerminalCallStatus(call.status)) {
        dismissIncomingCall(call.status);
      }
    });
  }, [busy, dismissIncomingCall, incomingCall?.id, resetCallState]);

  // Track outgoing / active call status from Firestore.
  useEffect(() => {
    if (!watchedCallId) return;

    return onSnapshot(doc(db, "calls", watchedCallId), (snap) => {
      if (!snap.exists()) return;
      const call = mapCallDoc(snap.id, snap.data());
      const currentPhase = phaseRef.current;

      if (call.status === "active") {
        clearRingTimer();
        if (currentPhase === "outgoing") {
          setActiveCall(call);
          setStartedAtMs(Date.now());
          setPhase("active");
        }
        return;
      }

      if (isTerminalCallStatus(call.status) && currentPhase === "outgoing") {
        clearRingTimer();
        void disconnectRoom();
        resetCallState();
        if (call.status === "declined") {
          showToast("对方已拒绝", "info");
        } else if (call.status === "missed") {
          showToast("对方未接听", "info");
        }
        return;
      }

      if (call.status === "ended" && currentPhase === "active") {
        void disconnectRoom();
        resetCallState();
        showToast("通话已结束", "info");
      }
    });
  }, [
    watchedCallId,
    clearRingTimer,
    disconnectRoom,
    resetCallState,
    showToast,
  ]);

  useEffect(() => {
    if (phase !== "active" || activeCall?.callMode !== "video") return;
    const room = roomRef.current;
    if (!room) return;
    void canFlipLocalCamera().then(setCanFlipCamera);
    setCameraFacing(getLocalCameraFacing(room));
  }, [phase, activeCall?.callMode, startedAtMs]);

  // Re-sync camera capture when the phone is rotated during a video call.
  useEffect(() => {
    if (phase !== "active" || activeCall?.callMode !== "video" || isCameraOff) {
      return;
    }

    return subscribeDeviceOrientation(() => {
      const room = roomRef.current;
      if (!room) return;
      void syncLocalCameraOrientation(room, cameraFacing);
    });
  }, [activeCall?.callMode, cameraFacing, isCameraOff, phase]);

  useEffect(() => {
    return () => {
      clearRingTimer();
      void disconnectRoom();
    };
  }, [clearRingTimer, disconnectRoom]);

  const showIncoming = phase === "incoming" && !!incomingCall;
  const showActive = phase === "outgoing" || phase === "active";
  const activeCallMode =
    activeCall?.callMode ?? incomingCall?.callMode ?? "voice";
  const isVideoCall = activeCallMode === "video";

  return (
    <CallContext.Provider
      value={{
        phase,
        startVoiceCall,
        startVideoCall,
        isInCall: phase !== "idle",
      }}
    >
      {children}
      <IncomingCallOverlay
        open={showIncoming}
        callerName={incomingCall?.callerName || "对方"}
        callMode={incomingCall?.callMode}
        onAccept={acceptIncoming}
        onDecline={declineIncoming}
        busy={busy}
      />
      {isVideoCall ? (
        <ActiveVideoCall
          open={showActive}
          peerName={peerName}
          callMode="video"
          startedAtMs={phase === "active" ? startedAtMs : null}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          cameraFacing={cameraFacing}
          canFlipCamera={canFlipCamera}
          audioBlocked={audioBlocked}
          roomRef={roomRef}
          onUnlockAudio={async () => {
            const room = roomRef.current;
            if (!room) return;
            try {
              await unlockRoomAudio(room);
              setAudioBlocked(!room.canPlaybackAudio);
            } catch {
              showToast("无法播放对方声音，请检查浏览器权限", "error");
            }
          }}
          onToggleMute={async () => {
            const room = roomRef.current;
            if (!room) return;
            const next = !isMuted;
            await room.localParticipant.setMicrophoneEnabled(!next);
            setIsMuted(next);
          }}
          onToggleCamera={async () => {
            const room = roomRef.current;
            if (!room) return;
            if (isCameraOff) {
              await room.localParticipant.setCameraEnabled(
                true,
                getVideoCaptureOptions(cameraFacing),
              );
              setIsCameraOff(false);
            } else {
              await room.localParticipant.setCameraEnabled(false);
              setIsCameraOff(true);
            }
          }}
          onFlipCamera={async () => {
            const room = roomRef.current;
            if (!room || isCameraOff) return;
            try {
              const next = await flipLocalCamera(room);
              setCameraFacing(next);
            } catch (e) {
              console.error(e);
              showToast(
                e instanceof Error ? e.message : "无法切换摄像头",
                "error",
              );
            }
          }}
          onEnd={async () => {
            if (phase === "outgoing") {
              await cancelOutgoingCall();
              return;
            }
            await endActiveCall();
          }}
          ending={busy}
        />
      ) : (
        <ActiveVoiceCall
          open={showActive}
          peerName={peerName}
          startedAtMs={phase === "active" ? startedAtMs : null}
          isMuted={isMuted}
          audioBlocked={audioBlocked}
          onUnlockAudio={async () => {
            const room = roomRef.current;
            if (!room) return;
            try {
              await unlockRoomAudio(room);
              setAudioBlocked(!room.canPlaybackAudio);
            } catch {
              showToast("无法播放对方声音，请检查浏览器权限", "error");
            }
          }}
          onToggleMute={async () => {
            const room = roomRef.current;
            if (!room) return;
            const next = !isMuted;
            await room.localParticipant.setMicrophoneEnabled(!next);
            setIsMuted(next);
          }}
          onEnd={async () => {
            if (phase === "outgoing") {
              await cancelOutgoingCall();
              return;
            }
            await endActiveCall();
          }}
          ending={busy}
        />
      )}
    </CallContext.Provider>
  );
}
