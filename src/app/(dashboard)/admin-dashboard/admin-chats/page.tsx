"use client";

import React, { useState } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";

const mockConversations = [
  {
    id: 1,
    name: "Sarah Wilson",
    initials: "SW",
    subject: "Question about medication",
    lastMessage: "Thank you for the clarification, Dr.",
    date: "14/01/2024",
    unread: true,
    active: false,
  },
  {
    id: 2,
    name: "Robert Brown",
    initials: "RB",
    subject: "Lab results inquiry",
    lastMessage: "When will my lab results be available?",
    date: "14/01/2024",
    unread: true,
    active: false,
  },
  {
    id: 3,
    name: "Emily Davis",
    initials: "ED",
    subject: "Appointment rescheduling",
    lastMessage: "Perfect, Tuesday at 2:00 PM works.",
    date: "13/01/2024",
    unread: false,
    active: false,
  },
];

export default function AdminChatsPage() {
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const unreadCount = conversations.filter((c) => c.unread).length;
  const activeCount = conversations.length; // For demo, all are active

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, unread: false, active: true }
          : { ...c, active: false }
      )
    );
  };

  const handleBack = () => {
    setSelectedId(null);
  };

  const selectedConversation = conversations.find((c) => c.id === selectedId);

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
              selectedId !== null ? "hidden" : "flex"
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
                  No conversations found.
                </div>
              ) : (
                filteredConversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className={`w-full flex items-start gap-3 py-3 px-2 rounded-lg transition text-left ${
                      c.active
                        ? "bg-green-50 border border-green-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-500 text-base">
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {c.name}
                        </span>
                        {c.unread && (
                          <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 font-semibold">
                            Unread
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate font-medium">
                        {c.subject}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {c.lastMessage}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{c.date}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          {/* Main Chat Area: hidden on mobile unless a conversation is selected */}
          <div
            className={`flex-1 bg-white rounded-xl border shadow-sm flex flex-col items-center justify-center min-h-[350px] p-8 ${
              selectedId === null ? "hidden" : "flex"
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
                <div className="flex items-center gap-3 border-b pb-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-500 text-base">
                    {selectedConversation.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {selectedConversation.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedConversation.subject}
                    </div>
                  </div>
                </div>
                {/* Chat messages (mock) */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto mb-4">
                  <div className="self-start bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-800 max-w-xs">
                    Hi Doctor, I have a question about my medication.
                  </div>
                  <div className="self-end bg-green-100 rounded-lg px-4 py-2 text-sm text-gray-800 max-w-xs">
                    Sure, please go ahead.
                  </div>
                  <div className="self-start bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-800 max-w-xs">
                    Is it safe to take with my current prescription?
                  </div>
                  <div className="self-end bg-green-100 rounded-lg px-4 py-2 text-sm text-gray-800 max-w-xs">
                    Yes, it is safe. Let me know if you have more questions.
                  </div>
                </div>
                {/* Chat input */}
                <form
                  className="flex gap-2 mt-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
                  >
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
