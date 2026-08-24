"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, File, Loader2 } from "lucide-react";
import type { ChatMessage, Conversation, Message } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  createConversation,
  listConversations,
  markConversationRead,
} from "@/lib/api/chat";
import { useMessageCache } from "@/hooks/useMessageCache";
import { usePeerPresence, useTypingIndicator } from "@/hooks/useChatPresence";
import { useUnreadBadge } from "@/hooks/useUnreadBadge";
import { ChatPeerStatus } from "@/components/chat/ChatPeerStatus";

function toUiMessage(msg: ChatMessage, myUserId?: string): Message {
  const mine =
    msg.senderId === myUserId ||
    msg.sender === "patient" ||
    msg.sender === "user";
  return {
    id: msg.id,
    text: msg.content,
    sender: mine ? "user" : "doctor",
    timestamp: new Date(msg.createdAt),
    type: "text",
  };
}

export default function ChatInterface() {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const { refresh: refreshUnread } = useUnreadBadge();
  const cache = useMessageCache(token);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const peerId = currentConversation?.peer?.id;
  const online = usePeerPresence(peerId);
  const { peerTyping, emitTyping } = useTypingIndicator(
    currentConversation?.id,
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  const openConversation = useCallback(
    async (conversation: Conversation) => {
      setCurrentConversation(conversation);
      const cached = cache.getCached(conversation.id);
      if (cached) {
        setMessages(cached.map((m) => toUiMessage(m, user?.id)));
      }
      socket?.emit(
        "joinConversation",
        { conversationId: conversation.id },
        (ack?: { peers?: { userId: string; online: boolean }[] }) => {
          // presence handled by usePeerPresence + ack optional
          void ack;
        },
      );
      void markConversationRead(conversation.id, token).then(() =>
        refreshUnread(),
      );
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c,
        ),
      );
    },
    [cache, user?.id, socket, token, refreshUnread],
  );

  const createNewConversation = useCallback(async () => {
    if (!token) return;
    try {
      const created = await createConversation({ type: "PATIENT_CARE" }, token);
      const conversation: Conversation = {
        id: created.id,
        type: created.type,
        messages: [],
        unreadCount: 0,
      };
      cache.setCached(conversation.id, []);
      setConversations([conversation]);
      await openConversation(conversation);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create conversation",
      );
    }
  }, [token, cache, openConversation]);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      setBootLoading(true);
      setError(null);
      const data = await listConversations(token);
      const care = (data || []).filter(
        (c) => c.type === "PATIENT_CARE" || !c.type,
      );
      const list = care.length ? care : data || [];
      setConversations(list);
      await cache.preloadMany(list.map((c) => c.id));
      if (list.length > 0) {
        await openConversation(list[0]);
      } else {
        await createNewConversation();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load conversations",
      );
    } finally {
      setBootLoading(false);
    }
  }, [token, cache, openConversation, createNewConversation]);

  useEffect(() => {
    if (token) void loadConversations();
  }, [token, loadConversations]);

  useEffect(() => {
    if (!socket) return;
    const onReceive = (message: ChatMessage) => {
      cache.appendCached(message.conversationId || "", message);
      if (
        currentConversation &&
        message.conversationId === currentConversation.id
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [
            ...prev.filter((m) => !m.id.startsWith("temp-")),
            toUiMessage(message, user?.id),
          ];
        });
        void markConversationRead(currentConversation.id, token).then(() =>
          refreshUnread(),
        );
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === message.conversationId
              ? {
                  ...c,
                  unreadCount: (c.unreadCount || 0) + 1,
                  messages: [
                    {
                      id: message.id,
                      content: message.content,
                      sender: message.sender,
                      senderId: message.senderId,
                      createdAt: message.createdAt,
                    },
                  ],
                }
              : c,
          ),
        );
        void refreshUnread();
      }
    };
    socket.on("receiveMessage", onReceive);
    return () => {
      socket.off("receiveMessage", onReceive);
    };
  }, [socket, currentConversation, user?.id, cache, token, refreshUnread]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !currentConversation || !socket) return;
    const content = inputText.trim();
    setInputText("");
    emitTyping(false);

    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        text: content,
        sender: "user",
        timestamp: new Date(),
        type: "text",
      },
    ]);

    socket.emit("sendMessage", {
      conversationId: currentConversation.id,
      content,
    });
  };

  if (bootLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#1d884a]" />
        <p className="text-sm text-gray-600">Loading conversations...</p>
      </div>
    );
  }

  if (error && !currentConversation) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-red-700">
            Connection Error
          </h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button
            onClick={() => void loadConversations()}
            className="bg-green-700 hover:bg-green-600"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-96 rounded-lg border border-gray-200 bg-white shadow-lg">
      <div className="w-80 border-r border-gray-200 bg-gray-50">
        <div className="border-b border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800">Conversations</h3>
        </div>
        <div className="h-full overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet. Start chatting with your care team!
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => void openConversation(conversation)}
                className={`cursor-pointer border-b border-gray-200 p-4 hover:bg-gray-100 ${
                  currentConversation?.id === conversation.id
                    ? "bg-green-50"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700">
                    <span className="font-semibold text-white">CT</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="truncate font-medium text-gray-800">
                        {conversation.peer?.fullName || "Care team"}
                      </h4>
                      {(conversation.unreadCount || 0) > 0 ? (
                        <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-gray-500">
                      {conversation.messages?.[0]?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700">
              <span className="font-semibold text-white">CT</span>
            </div>
            <div>
              <h3 className="font-semibold text-green-700">
                {currentConversation?.peer?.fullName || "Care team"}
              </h3>
              <ChatPeerStatus online={online} typing={peerTyping} />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {currentConversation
                ? "No messages yet. Start the conversation!"
                : "Setting up your chat..."}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                    message.sender === "user"
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.type === "text" && <p>{message.text}</p>}
                  {message.type === "image" && message.fileUrl && (
                    <div>
                      <Image
                        src={message.fileUrl}
                        alt="Shared image"
                        width={320}
                        height={240}
                        className="h-auto max-w-full rounded"
                        unoptimized
                      />
                    </div>
                  )}
                  {message.type === "file" && (
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span>{message.fileName}</span>
                    </div>
                  )}
                  <p className="mt-1 text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Input
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                emitTyping(Boolean(e.target.value.trim()));
              }}
              placeholder="Message your care team..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="bg-green-700 hover:bg-green-600 disabled:bg-gray-300"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
