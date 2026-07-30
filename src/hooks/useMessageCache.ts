"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/types";
import { getMessages } from "@/lib/api/chat";

export function useMessageCache(token: string | null) {
  const cacheRef = useRef<Map<string, ChatMessage[]>>(new Map());
  const [, setVersion] = useState(0);

  const getCached = useCallback((conversationId: string) => {
    return cacheRef.current.get(conversationId);
  }, []);

  const setCached = useCallback(
    (conversationId: string, messages: ChatMessage[]) => {
      cacheRef.current.set(conversationId, messages);
      setVersion((v) => v + 1);
    },
    [],
  );

  const appendCached = useCallback(
    (conversationId: string, message: ChatMessage) => {
      const prev = cacheRef.current.get(conversationId) || [];
      if (prev.some((m) => m.id === message.id)) return;
      const next = [...prev.filter((m) => !m.id.startsWith("temp-")), message];
      cacheRef.current.set(conversationId, next);
      setVersion((v) => v + 1);
    },
    [],
  );

  const preloadMany = useCallback(
    async (conversationIds: string[]) => {
      if (!token) return;
      const missing = conversationIds.filter((id) => !cacheRef.current.has(id));
      await Promise.all(
        missing.map(async (id) => {
          try {
            const rows = await getMessages(id, token);
            cacheRef.current.set(id, rows || []);
          } catch {
            cacheRef.current.set(id, []);
          }
        }),
      );
      if (missing.length) setVersion((v) => v + 1);
    },
    [token],
  );

  return useMemo(
    () => ({
      getCached,
      setCached,
      appendCached,
      preloadMany,
    }),
    [getCached, setCached, appendCached, preloadMany],
  );
}
