"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Message } from "@/types/chat";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

interface ChatContextType {
  messages: Message[];
  conversations: any[];
  currentConversation: any | null;
  isConnected: boolean;
  isLoading: boolean;
  sendMessage: (content: string) => void;
  joinConversation: (conversationId: string) => void;
  loadConversations: () => void;
  loadMessages: (conversationId: string) => void;
  setCurrentConversation: (conversation: any) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<any | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { socket, isConnected } = useSocket();
  const { token, user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message: any) => {
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

    socket.on("userTyping", (data: any) => {
      // Handle typing indicators
      console.log("User typing:", data);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
    };
  }, [socket]);

  const sendMessage = async (content: string) => {
    if (!currentConversation || !socket) return;

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      text: content,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    // Optimistically add message
    setMessages((prev) => [...prev, newMessage]);

    // Send via socket
    socket.emit("sendMessage", {
      conversationId: currentConversation.id,
      content: content,
    });
  };

  const joinConversation = (conversationId: string) => {
    if (socket) {
      socket.emit("joinConversation", { conversationId });
    }
  };

  const loadConversations = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3001/chat/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:3001/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const formattedMessages: Message[] = data.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender === "admin" ? "doctor" : "user",
          timestamp: new Date(msg.createdAt),
          type: "text",
        }));
        setMessages(formattedMessages);
        joinConversation(conversationId);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        conversations,
        currentConversation,
        isConnected,
        isLoading,
        sendMessage,
        joinConversation,
        loadConversations,
        loadMessages,
        setCurrentConversation,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
