"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { SOCKET_URL } from "@/lib/api/config";

type CallSocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const CallSocketContext = createContext<CallSocketContextType | undefined>(
  undefined,
);

export function CallSocketProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const disconnect = useCallback(() => {
    setSocket((current) => {
      if (current) current.disconnect();
      return null;
    });
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!token || !user) {
      disconnect();
      return;
    }

    const next = io(`${SOCKET_URL}/calls`, {
      auth: { token },
      transports: ["websocket"],
    });

    next.on("connect", () => setIsConnected(true));
    next.on("disconnect", () => setIsConnected(false));
    next.on("connect_error", () => setIsConnected(false));

    setSocket(next);

    return () => {
      next.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, user, disconnect]);

  return (
    <CallSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </CallSocketContext.Provider>
  );
}

export function useCallSocket() {
  const ctx = useContext(CallSocketContext);
  if (!ctx) {
    throw new Error("useCallSocket must be used within a CallSocketProvider");
  }
  return ctx;
}
