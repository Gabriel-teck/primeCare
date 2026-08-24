"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { getUnreadCount } from "@/lib/api/chat";

const UNREAD_EVENT = "primecare-unread";
const UNREAD_KEY = "primecare-message-unread";

export function publishUnreadCount(count: number) {
  try {
    localStorage.setItem(UNREAD_KEY, String(count));
  } catch {
    // ignore
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(UNREAD_EVENT, { detail: { count } }));
  }
}

export function useUnreadBadge() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!token) {
      setCount(0);
      publishUnreadCount(0);
      return 0;
    }
    try {
      const res = await getUnreadCount(token);
      const next = res?.count ?? 0;
      setCount(next);
      publishUnreadCount(next);
      return next;
    } catch {
      return 0;
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onLocal = (e: Event) => {
      const detail = (e as CustomEvent<{ count: number }>).detail;
      if (typeof detail?.count === "number") setCount(detail.count);
    };
    window.addEventListener(UNREAD_EVENT, onLocal);
    return () => window.removeEventListener(UNREAD_EVENT, onLocal);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const bump = () => {
      void refresh();
    };
    socket.on("inboxUpdate", bump);
    socket.on("receiveMessage", bump);
    return () => {
      socket.off("inboxUpdate", bump);
      socket.off("receiveMessage", bump);
    };
  }, [socket, refresh]);

  return { count, refresh };
}
