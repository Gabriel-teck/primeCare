"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/SocketContext";

export function usePeerPresence(peerId?: string | null) {
  const { socket, isConnected } = useSocket();
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!socket || !peerId) {
      setOnline(false);
      return;
    }

    socket.emit(
      "getPresence",
      { userIds: [peerId] },
      (rows?: { userId: string; online: boolean }[]) => {
        const hit = rows?.find((r) => r.userId === peerId);
        setOnline(Boolean(hit?.online));
      },
    );

    const onPresence = (payload: { userId: string; online: boolean }) => {
      if (payload.userId === peerId) setOnline(payload.online);
    };
    socket.on("presenceUpdate", onPresence);
    return () => {
      socket.off("presenceUpdate", onPresence);
    };
  }, [socket, peerId, isConnected]);

  return online;
}

export function useTypingIndicator(conversationId?: string | null) {
  const { socket } = useSocket();
  const [peerTyping, setPeerTyping] = useState(false);
  const timerRef = useRef<number | null>(null);
  const lastSent = useRef(false);

  useEffect(() => {
    setPeerTyping(false);
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return;
    const onTyping = (payload: {
      userId?: string;
      conversationId?: string;
      isTyping: boolean;
    }) => {
      if (
        conversationId &&
        payload.conversationId &&
        payload.conversationId !== conversationId
      ) {
        return;
      }
      setPeerTyping(Boolean(payload.isTyping));
      if (payload.isTyping) {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setPeerTyping(false), 2500);
      }
    };
    socket.on("userTyping", onTyping);
    return () => {
      socket.off("userTyping", onTyping);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [socket, conversationId]);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || !conversationId) return;
      if (lastSent.current === isTyping) return;
      lastSent.current = isTyping;
      socket.emit("typing", { conversationId, isTyping });
      if (isTyping) {
        window.setTimeout(() => {
          lastSent.current = false;
        }, 1200);
      }
    },
    [socket, conversationId],
  );

  return { peerTyping, emitTyping };
}
