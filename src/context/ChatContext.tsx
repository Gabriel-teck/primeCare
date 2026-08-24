"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Message } from "@/types/chat";
import { getMessages, listConversations } from "@/lib/api/chat";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

type ChatApiMessage = {
  id: string;
  content: string;
  sender: string;
  createdAt: string;
  conversationId?: string;
};

type Conversation = {
  id: string;
  patientId?: string;
  adminId?: string;
  messages?: ChatApiMessage[];
  createdAt?: string;
  updatedAt?: string;
};

type TypingPayload = {
  isTyping?: boolean;
  userId?: string;
};

interface ChatContextType {
  messages: Message[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isConnected: boolean;
  isLoading: boolean;
  sendMessage: (content: string) => void;
  joinConversation: (conversationId: string) => void;
  loadConversations: () => void;
  loadMessages: (conversationId: string) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { socket, isConnected } = useSocket();
  const { token } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message: ChatApiMessage) => {
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

    socket.on("userTyping", (data: TypingPayload) => {
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
      const data = await listConversations(token);
      setConversations(data as Conversation[]);
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
      const data = await getMessages(conversationId, token);
      const formattedMessages: Message[] = data.map((msg) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender === "admin" ? "doctor" : "user",
        timestamp: new Date(msg.createdAt),
        type: "text",
      }));
      setMessages(formattedMessages);
      joinConversation(conversationId);
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
