"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Send,
  Phone,
  Paperclip,
  Image as ImageIcon,
  File,
  X,
  Video,
  Mic,
} from "lucide-react";
import { Message } from "@/types/chat";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

export default function ChatInterface() {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<any | null>(
    null
  );
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations on mount
  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message: any) => {
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

    socket.on("userTyping", (data: any) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      console.log(
        "Loading conversations with token:",
        token.substring(0, 20) + "..."
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
          `Failed to load conversations: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Loaded conversations:", data);
      setConversations(data);

      // If there are conversations, select the first one
      if (data.length > 0) {
        handleConversationSelect(data[0]);
      } else {
        // Create a new conversation if none exists
        await createNewConversation();
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load conversations"
      );
      // Try to create a new conversation even if loading fails
      await createNewConversation();
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
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
          `Failed to create conversation: ${response.status} - ${errorText}`
        );
      }

      const conversation = await response.json();
      console.log("Created conversation:", conversation);

      setCurrentConversation(conversation);
      setConversations([conversation]);

      // Join the conversation room
      if (socket) {
        socket.emit("joinConversation", { conversationId: conversation.id });
        console.log("Joined conversation room:", conversation.id);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create conversation"
      );
    }
  };

  const loadMessages = async (conversationId: string) => {
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
        }
      );

      console.log("Messages response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Messages response error:", errorText);
        throw new Error(
          `Failed to load messages: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Loaded messages:", data);
      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender === "admin" ? "doctor" : "user",
        timestamp: new Date(msg.createdAt),
        type: "text",
      }));
      setMessages(formattedMessages);

      // Join conversation room
      if (socket) {
        socket.emit("joinConversation", { conversationId });
        console.log("Joined conversation room:", conversationId);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load messages"
      );
    } finally {
      setIsLoading(false);
    }
  };

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

    // Optimistically add message
    setMessages((prev) => [...prev, newMessage]);

    // Send via socket
    socket.emit("sendMessage", {
      conversationId: currentConversation.id,
      content: content,
    });

    console.log("Message sent via socket");
  };

  const handleSendMessage = () => {
    if (!inputText.trim() && !selectedFile) return;

    console.log("Handling send message:", inputText);
    sendMessage(inputText);
    setInputText("");
    setSelectedFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConversationSelect = (conversation: any) => {
    console.log("Selected conversation:", conversation);
    setCurrentConversation(conversation);
    loadMessages(conversation.id);
  };

  const handleCall = () => {
    alert("Initiating call with doctor...");
  };

  const handleVideoCall = () => {
    alert("Initiating video call with doctor...");
  };

  const handleVoiceMessage = () => {
    alert("Voice message feature coming soon...");
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
              No conversations yet. Start chatting with a doctor!
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                  currentConversation?.id === conversation.id
                    ? "bg-green-50"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">Dr</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      Dr. Gabriel Udoh
                    </h4>
                    <p className="text-sm text-gray-500">
                      {conversation.messages?.length > 0
                        ? conversation.messages[
                            conversation.messages.length - 1
                          ].content.substring(0, 30) + "..."
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">Dr</span>
            </div>
            <div>
              <h3 className="font-semibold text-green-700">Dr. Gabriel Udoh</h3>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCall}
              variant="outline"
              size="sm"
              className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleVideoCall}
              variant="outline"
              size="sm"
              className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white"
            >
              <Video className="h-4 w-4" />
            </Button>
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
                  {message.type === "image" && (
                    <div>
                      <img
                        src={message.fileUrl}
                        alt="Shared image"
                        className="max-w-full h-auto rounded"
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

        {/* File Preview */}
        {selectedFile && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedFile.type.startsWith("image/") ? (
                  <ImageIcon className="h-4 w-4 text-green-700" />
                ) : (
                  <File className="h-4 w-4 text-green-700" />
                )}
                <span className="text-sm text-gray-700">
                  {selectedFile.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeSelectedFile}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceMessage}
              className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
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
