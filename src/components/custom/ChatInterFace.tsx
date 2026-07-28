"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, File } from "lucide-react";
import { Message } from "@/types/chat";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

type ConversationMessage = {
  content?: string;
};

type Conversation = {
  id: string;
  messages?: ConversationMessage[];
};

type IncomingChatMessage = {
  id: string;
  content: string;
  sender: string;
  createdAt: string;
};

type ApiChatMessage = {
  id: string;
  content: string;
  sender: string;
  createdAt: string;
};

export default function ChatInterface() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [inputText, setInputText] = useState("");
  const [, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message: IncomingChatMessage) => {
      console.log("Received message:", message);
      setMessages((prev) => [
        ...prev,
        {
          id: message.id,
          text: message.content,
          sender: message.sender === "admin" ? "doctor" : "user",
          timestamp: new Date(message.createdAt),
          type: "text",
        },
      ]);
    });

    socket.on("userTyping", (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!token) return;

      try {
        setIsLoading(true);
        console.log("Loading messages for conversation:", conversationId);

        const response = await fetch(
          `http://localhost:3001/chat/conversations/${conversationId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("Messages response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Messages response error:", errorText);
          throw new Error(
            `Failed to load messages: ${response.status} - ${errorText}`,
          );
        }

        const data: ApiChatMessage[] = await response.json();
        console.log("Loaded messages:", data);
        const formattedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender === "admin" ? "doctor" : "user",
          timestamp: new Date(msg.createdAt),
          type: "text",
        }));
        setMessages(formattedMessages);

        if (socket) {
          socket.emit("joinConversation", { conversationId });
          console.log("Joined conversation room:", conversationId);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load messages",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [token, socket],
  );

  const handleConversationSelect = useCallback(
    (conversation: Conversation) => {
      console.log("Selected conversation:", conversation);
      setCurrentConversation(conversation);
      void loadMessages(conversation.id);
    },
    [loadMessages],
  );

  const createNewConversation = useCallback(async () => {
    if (!token) return;

    try {
      console.log("Creating new conversation...");
      const response = await fetch("http://localhost:3001/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId: "4e0a4401-c205-4bdb-8edf-3d6c24bf6951", // PrimeCare Admin ID
        }),
      });

      console.log("Create conversation response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Create conversation error:", errorText);
        throw new Error(
          `Failed to create conversation: ${response.status} - ${errorText}`,
        );
      }

      const conversation: Conversation = await response.json();
      console.log("Created conversation:", conversation);

      setCurrentConversation(conversation);
      setConversations([conversation]);

      if (socket) {
        socket.emit("joinConversation", { conversationId: conversation.id });
        console.log("Joined conversation room:", conversation.id);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create conversation",
      );
    }
  }, [token, socket]);

  const loadConversations = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      console.log(
        "Loading conversations with token:",
        token.substring(0, 20) + "...",
      );

      const response = await fetch("http://localhost:3001/chat/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Conversations response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Conversations response error:", errorText);
        throw new Error(
          `Failed to load conversations: ${response.status} - ${errorText}`,
        );
      }

      const data: Conversation[] = await response.json();
      console.log("Loaded conversations:", data);
      setConversations(data);

      if (data.length > 0) {
        handleConversationSelect(data[0]);
      } else {
        await createNewConversation();
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load conversations",
      );
      await createNewConversation();
    } finally {
      setIsLoading(false);
    }
  }, [token, handleConversationSelect, createNewConversation]);

  useEffect(() => {
    if (token) {
      void loadConversations();
    }
  }, [token, loadConversations]);

  const sendMessage = async (content: string) => {
    if (!currentConversation) {
      console.error("No conversation available");
      return;
    }

    if (!socket) {
      console.error("No socket available");
      return;
    }

    console.log("Sending message:", content);
    console.log("Conversation ID:", currentConversation.id);
    console.log("Socket connected:", socket.connected);

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      text: content,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);

    socket.emit("sendMessage", {
      conversationId: currentConversation.id,
      content: content,
    });

    console.log("Message sent via socket");
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    void sendMessage(inputText);
    setInputText("");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-700">
            Loading conversations...
          </h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Connection Error
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={loadConversations}
            className="bg-green-700 hover:bg-green-600"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-96 bg-white border border-gray-200 rounded-lg shadow-lg">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Conversations</h3>
        </div>
        <div className="overflow-y-auto h-full">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet. Start chatting with your care team!
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
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
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">Care team</h4>
                    <p className="text-sm text-gray-500">
                      {(conversation.messages?.length ?? 0) > 0
                        ? (
                            conversation.messages?.[
                              (conversation.messages?.length ?? 1) - 1
                            ]?.content ?? ""
                          ).substring(0, 30) + "..."
                        : "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700">
              <span className="font-semibold text-white">CT</span>
            </div>
            <div>
              <h3 className="font-semibold text-green-700">Care team</h3>
              <p className="text-sm text-green-600">Text messaging</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
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
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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
                        className="max-w-full h-auto rounded"
                        unoptimized
                      />
                      <p className="text-xs mt-1 opacity-75">
                        {message.fileName}
                      </p>
                    </div>
                  )}
                  {message.type === "file" && (
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span>{message.fileName}</span>
                    </div>
                  )}
                  <p className="text-xs opacity-75 mt-1">
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

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
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
