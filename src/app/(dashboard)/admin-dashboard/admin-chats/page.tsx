"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, ArrowLeft, Send, Phone, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { getAllPatients } from "@/lib/api/user";

type Patient = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  patientId: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  patient?: Patient;
};

type Message = {
  id: string;
  content: string;
  sender: "patient" | "admin";
  senderId: string;
  createdAt: string;
};

type ConversationWithPatient = Conversation & {
  patient: Patient;
  lastMessage: string;
  unreadCount: number;
  initials: string;
};

export default function AdminChatsPage() {
  const { token, user } = useAuth();
  const { socket, isConnected } = useChat();
  const [conversations, setConversations] = useState<ConversationWithPatient[]>(
    []
  );
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithPatient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations and patients
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching conversations and patients...");

        // Fetch conversations
        const conversationsResponse = await fetch(
          "http://localhost:3001/chat/conversations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!conversationsResponse.ok) {
          throw new Error(
            `Failed to fetch conversations: ${conversationsResponse.status}`
          );
        }

        const conversationsData = await conversationsResponse.json();
        console.log("Conversations data:", conversationsData);

        // Ensure conversationsData is an array
        if (!Array.isArray(conversationsData)) {
          console.error(
            "Conversations data is not an array:",
            conversationsData
          );
          setConversations([]);
          return;
        }

        // Fetch patients
        const patientsData = await getAllPatients(token);
        console.log("Patients data:", patientsData);

        // Get patient information for each conversation
        const conversationsWithPatients = conversationsData.map(
          (conv: Conversation) => {
            const patient = patientsData.find(
              (p: Patient) => p.id === conv.patientId
            );
            const lastMessage =
              conv.messages?.length > 0
                ? conv.messages[conv.messages.length - 1].content
                : "No messages yet";

            const unreadCount =
              conv.messages?.filter(
                (msg: Message) => msg.sender === "patient" && !msg.read
              ).length || 0;

            const initials =
              patient?.fullName
                ?.split(" ")
                .map((name) => name.charAt(0))
                .join("")
                .toUpperCase()
                .slice(0, 2) || "NA";

            return {
              ...conv,
              patient,
              lastMessage,
              unreadCount,
              initials,
            };
          }
        );

        console.log("Processed conversations:", conversationsWithPatients);
        setConversations(conversationsWithPatients);
        setPatients(patientsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
        setConversations([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message: any) => {
      setMessages((prev) => [...prev, message]);

      // Update conversation's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message.content }
            : conv
        )
      );
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId: string) => {
    if (!token) return;

    setMessagesLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`);
      }

      const messagesData = await response.json();
      console.log("Messages data:", messagesData);

      if (!Array.isArray(messagesData)) {
        console.error("Messages data is not an array:", messagesData);
        setMessages([]);
        return;
      }

      setMessages(messagesData);

      // Join conversation room
      if (socket) {
        socket.emit("joinConversation", { conversationId });
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load messages"
      );
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectConversation = (conversation: ConversationWithPatient) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedConversation || !socket) return;

    const newMessage = {
      id: `temp-${Date.now()}`,
      content: inputText,
      sender: "admin" as const,
      senderId: user?.id,
      createdAt: new Date().toISOString(),
    };

    // Optimistically add message
    setMessages((prev) => [...prev, newMessage]);

    // Send via socket
    socket.emit("sendMessage", {
      conversationId: selectedConversation.id,
      content: inputText,
    });

    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleCall = (email: string) => {
    alert(`Initiating call with ${email}`);
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.patient?.fullName.toLowerCase().includes(q) ||
      c.patient?.email.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const unreadCount = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );
  const activeCount = conversations.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 text-lg font-semibold mb-2">
                Error Loading Chat
              </div>
              <div className="text-gray-600">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col p-4 md:p-8">
        <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Messages & Chat
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Communicate with patients and manage conversations
            </p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <span className="bg-red-100 text-red-600 text-xs font-semibold rounded-full px-3 py-1">
              {unreadCount} Unread
            </span>
            <span className="bg-purple-100 text-purple-600 text-xs font-semibold rounded-full px-3 py-1">
              {activeCount} Active Chats
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 mt-4">
          {/* Sidebar: hidden on mobile if a conversation is selected */}
          <div
            className={`bg-white rounded-xl border shadow-sm w-full md:w-80 flex flex-col p-4 max-h-[70vh] md:max-h-[80vh] ${
              selectedConversation !== null ? "hidden" : "flex"
            } md:flex`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-lg text-gray-800">
                Conversations
              </span>
              <span className="bg-gray-100 text-gray-500 text-xs rounded-full px-2 py-0.5 font-semibold">
                {filteredConversations.length}
              </span>
            </div>

            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />

            <div className="mb-3">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-sm font-medium">
                All Messages
                <svg
                  className="w-4 h-4 ml-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y">
              {filteredConversations.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  {conversations.length === 0
                    ? "No conversations yet."
                    : "No conversations found."}
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full flex items-start gap-3 py-3 px-2 rounded-lg transition text-left ${
                      selectedConversation?.id === conv.id
                        ? "bg-green-50 border border-green-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-500 text-base">
                      {conv.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {conv.patient?.fullName || "Unknown Patient"}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 font-semibold">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate font-medium">
                        {conv.patient?.email}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {conv.lastMessage}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area: hidden on mobile unless a conversation is selected */}
          <div
            className={`flex-1 bg-white rounded-xl border shadow-sm flex flex-col items-center justify-center min-h-[350px] p-8 ${
              selectedConversation === null ? "hidden" : "flex"
            } md:flex`}
          >
            {!selectedConversation ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <div className="text-lg font-semibold text-gray-500 mb-2">
                  No conversation selected
                </div>
                <div className="text-gray-400 text-sm">
                  Choose a conversation from the list to start chatting
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full h-full">
                {/* Back button for mobile */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="md:hidden flex items-center gap-2 text-gray-600 mb-4 hover:text-green-700 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" /> Back to conversations
                </button>

                {/* Chat header */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-500 text-base">
                      {selectedConversation.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {selectedConversation.patient?.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedConversation.patient?.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleCall(selectedConversation.patient?.email || "")
                      }
                      className="p-2 rounded hover:bg-green-100"
                      title="Call"
                    >
                      <Phone className="w-5 h-5 text-green-600" />
                    </button>
                    <button
                      onClick={() =>
                        handleEmail(selectedConversation.patient?.email || "")
                      }
                      className="p-2 rounded hover:bg-blue-100"
                      title="Email"
                    >
                      <Mail className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "admin"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                            message.sender === "admin"
                              ? "bg-green-600 text-white"
                              : "bg-white text-gray-800 border border-gray-200"
                          }`}
                        >
                          <div className="text-xs opacity-75 mb-1">
                            {message.sender === "admin"
                              ? "You"
                              : selectedConversation.patient?.fullName}
                          </div>
                          {message.content}
                          <div className="text-xs opacity-75 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat input */}
                <form
                  className="flex gap-2 mt-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
