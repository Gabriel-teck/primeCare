"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { useCallSocket } from "./CallSocketContext";
import {
  acceptCall,
  declineCall,
  endCall,
  startCall,
  type CallMode,
  type CallSession,
} from "@/lib/api/calls";
import { CallRoom } from "@/components/calls/CallRoom";
import { IncomingCallModal } from "@/components/calls/IncomingCallModal";
import { getErrorMessage } from "@/lib/api/errors";

type IncomingCall = {
  callId: string;
  consultationId: string;
  mode: CallMode;
  from: { id: string; fullName: string };
};

type ActiveCall = CallSession & {
  remoteName?: string;
};

type CallContextType = {
  startConsultationCall: (
    consultationId: string,
    mode: CallMode,
    remoteName?: string,
  ) => Promise<void>;
  activeCall: ActiveCall | null;
};

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const { socket } = useCallSocket();
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [pendingStarter, setPendingStarter] = useState<ActiveCall | null>(null);

  const clearRing = useCallback(() => setIncoming(null), []);

  useEffect(() => {
    if (!socket) return;

    const onIncoming = (payload: IncomingCall) => {
      setIncoming(payload);
    };

    const onAccepted = (payload: {
      callId?: string;
      consultationId?: string;
      mode?: CallMode;
    }) => {
      setPendingStarter((prev) => {
        if (!prev || prev.callId !== payload.callId) return prev;
        queueMicrotask(() => setActiveCall(prev));
        return null;
      });
    };

    const onDeclined = (payload: { callId?: string }) => {
      setPendingStarter((prev) => {
        if (prev && prev.callId === payload.callId) {
          toast.message("Call declined");
          return null;
        }
        return prev;
      });
      setIncoming((prev) =>
        prev && prev.callId === payload.callId ? null : prev,
      );
    };

    const onEnded = (payload: { callId?: string }) => {
      setActiveCall((prev) => {
        if (prev && prev.callId === payload.callId) {
          toast.message("Call ended");
          return null;
        }
        return prev;
      });
      setPendingStarter((prev) =>
        prev && prev.callId === payload.callId ? null : prev,
      );
      setIncoming((prev) =>
        prev && prev.callId === payload.callId ? null : prev,
      );
    };

    socket.on("callIncoming", onIncoming);
    socket.on("callAccepted", onAccepted);
    socket.on("callDeclined", onDeclined);
    socket.on("callEnded", onEnded);

    return () => {
      socket.off("callIncoming", onIncoming);
      socket.off("callAccepted", onAccepted);
      socket.off("callDeclined", onDeclined);
      socket.off("callEnded", onEnded);
    };
  }, [socket]);

  const startConsultationCall = useCallback(
    async (consultationId: string, mode: CallMode, remoteName?: string) => {
      if (!token || !user) {
        toast.error("Please sign in to start a call");
        return;
      }
      if (activeCall || pendingStarter) {
        toast.message("You are already in a call");
        return;
      }
      try {
        const session = await startCall(consultationId, mode, token);
        setPendingStarter({ ...session, remoteName });
        toast.message(
          mode === "video" ? "Ringing for video call…" : "Ringing…",
        );
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not start call"));
      }
    },
    [token, user, activeCall, pendingStarter],
  );

  const handleAccept = async () => {
    if (!incoming || !token) return;
    setAccepting(true);
    try {
      const session = await acceptCall(
        incoming.consultationId,
        incoming.callId,
        token,
      );
      setActiveCall({
        ...session,
        remoteName: incoming.from.fullName,
      });
      clearRing();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not accept call"));
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!incoming || !token) return;
    try {
      await declineCall(incoming.consultationId, incoming.callId, token);
    } catch {
      // still clear UI
    }
    clearRing();
  };

  const handleEnd = async () => {
    const call = activeCall || pendingStarter;
    if (!call || !token) {
      setActiveCall(null);
      setPendingStarter(null);
      return;
    }
    try {
      await endCall(call.consultationId, call.callId, token);
    } catch {
      // ignore
    }
    setActiveCall(null);
    setPendingStarter(null);
  };

  return (
    <CallContext.Provider value={{ startConsultationCall, activeCall }}>
      {children}
      {incoming && !activeCall ? (
        <IncomingCallModal
          fromName={incoming.from.fullName}
          mode={incoming.mode}
          accepting={accepting}
          onAccept={() => void handleAccept()}
          onDecline={() => void handleDecline()}
        />
      ) : null}
      {pendingStarter && !activeCall ? (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-lg font-semibold text-[#212529]">Calling…</p>
            <p className="mt-1 text-sm text-gray-500">
              {pendingStarter.remoteName || "Waiting for answer"}
            </p>
            <ButtonCancelRing onCancel={() => void handleEnd()} />
          </div>
        </div>
      ) : null}
      {activeCall ? (
        <CallRoom
          callId={activeCall.callId}
          consultationId={activeCall.consultationId}
          mode={activeCall.mode}
          localPeerId={activeCall.localPeerId}
          remotePeerId={activeCall.remotePeerId}
          remoteName={activeCall.remoteName}
          onEnd={() => void handleEnd()}
        />
      ) : null}
    </CallContext.Provider>
  );
}

function ButtonCancelRing({ onCancel }: { onCancel: () => void }) {
  return (
    <button
      type="button"
      onClick={onCancel}
      className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-500"
    >
      Cancel
    </button>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return ctx;
}
