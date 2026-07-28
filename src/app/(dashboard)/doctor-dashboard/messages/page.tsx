"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminSearchInput,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  mockAdminDmMessages,
  mockPatientThreads,
  type AdminDmMessage,
  type PatientMessage,
  type PatientThread,
} from "@/lib/doctor/mock-data";

type Tab = "patients" | "admin";

export default function DoctorMessagesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <DoctorMessagesContent />
    </Suspense>
  );
}

function DoctorMessagesContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "admin" ? "admin" : "patients";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    searchParams.get("conversationId"),
  );
  const [showAdminThread, setShowAdminThread] = useState(
    searchParams.get("tab") === "admin",
  );
  const [patientThreads, setPatientThreads] =
    useState<PatientThread[]>(mockPatientThreads);
  const [adminMessages, setAdminMessages] =
    useState<AdminDmMessage[]>(mockAdminDmMessages);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const nextTab = searchParams.get("tab") === "admin" ? "admin" : "patients";
    setTab(nextTab);
    const conv = searchParams.get("conversationId");
    if (conv) {
      setSelectedPatientId(conv);
      setTab("patients");
    }
    if (nextTab === "admin") setShowAdminThread(true);
  }, [searchParams]);

  const unreadPatientTotal = useMemo(
    () =>
      patientThreads.reduce(
        (sum, t) =>
          sum +
          t.messages.filter((m) => !m.read && m.senderRole === "patient")
            .length,
        0,
      ),
    [patientThreads],
  );
  const unreadAdminTotal = useMemo(
    () =>
      adminMessages.filter((m) => !m.read && m.senderRole === "super_admin")
        .length,
    [adminMessages],
  );

  const filteredThreads = useMemo(() => {
    const q = search.toLowerCase();
    return patientThreads.filter(
      (t) =>
        !q ||
        t.patientName.toLowerCase().includes(q) ||
        t.patientEmail.toLowerCase().includes(q),
    );
  }, [patientThreads, search]);

  const selectedThread =
    patientThreads.find((t) => t.patientId === selectedPatientId) || null;

  const showPatientThread = tab === "patients" && Boolean(selectedThread);
  const showThread = tab === "admin" ? showAdminThread : showPatientThread;

  const sendPatientMessage = () => {
    if (!selectedPatientId || !draft.trim()) return;
    const message: PatientMessage = {
      id: `local-p-${Date.now()}`,
      senderId: "doc-1",
      senderRole: "doctor",
      content: draft.trim(),
      createdAt: new Date().toISOString(),
      read: true,
    };
    setPatientThreads((prev) => {
      const existing = prev.find((t) => t.patientId === selectedPatientId);
      if (existing) {
        return prev.map((t) =>
          t.patientId === selectedPatientId
            ? { ...t, messages: [...t.messages, message] }
            : t,
        );
      }
      return prev;
    });
    setDraft("");
  };

  const sendAdminMessage = () => {
    if (!draft.trim()) return;
    const message: AdminDmMessage = {
      id: `local-a-${Date.now()}`,
      senderId: "doc-1",
      senderRole: "doctor",
      content: draft.trim(),
      createdAt: new Date().toISOString(),
      read: true,
    };
    setAdminMessages((prev) => [...prev, message]);
    setDraft("");
  };

  const unreadForPatient = (patientId: string) =>
    patientThreads
      .find((t) => t.patientId === patientId)
      ?.messages.filter((m) => !m.read && m.senderRole === "patient").length ||
    0;

  const lastPreview = (thread: PatientThread) =>
    thread.messages.at(-1)?.content || "No messages yet";

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description="Chat with patients and the platform admin."
        className={showThread ? "hidden lg:flex" : undefined}
      />

      <div className="mb-3 flex gap-2">
        <TabButton
          active={tab === "patients"}
          onClick={() => {
            setTab("patients");
            setShowAdminThread(false);
          }}
          label="Patients"
          badge={unreadPatientTotal}
        />
        <TabButton
          active={tab === "admin"}
          onClick={() => {
            setTab("admin");
            setSelectedPatientId(null);
            setShowAdminThread(true);
          }}
          label="Admin"
          badge={unreadAdminTotal}
        />
      </div>

      <div className="relative grid h-[calc(100dvh-10rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:h-[70vh] lg:grid-cols-[320px_1fr]">
        {tab === "patients" ? (
          <>
            <aside
              className={`min-h-0 flex-col border-gray-200 lg:flex lg:border-r ${
                showPatientThread ? "hidden" : "flex"
              }`}
            >
              <div className="border-b border-gray-200 p-3">
                <AdminSearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search patients..."
                  label="Patients"
                />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredThreads.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">No conversations.</p>
                ) : (
                  filteredThreads.map((thread) => {
                    const unread = unreadForPatient(thread.patientId);
                    const active = selectedPatientId === thread.patientId;
                    return (
                      <button
                        key={thread.patientId}
                        type="button"
                        onClick={() => setSelectedPatientId(thread.patientId)}
                        className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors ${
                          active ? "bg-green-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                          {thread.patientName
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-medium text-[#212529]">
                              {thread.patientName}
                            </p>
                            {unread > 0 ? (
                              <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                                {unread}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 truncate text-xs text-gray-400">
                            {lastPreview(thread)}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <ThreadPane
              show={showPatientThread}
              onBack={() => setSelectedPatientId(null)}
              title={selectedThread?.patientName || ""}
              subtitle={selectedThread?.patientEmail || ""}
              emptyDesktop={
                <AdminEmptyState
                  title="Select a patient"
                  description="Choose a conversation to reply to a patient."
                />
              }
              hasSelection={Boolean(selectedThread)}
              messages={(selectedThread?.messages || []).map((msg) => ({
                id: msg.id,
                mine: msg.senderRole === "doctor",
                content: msg.content,
                createdAt: msg.createdAt,
              }))}
              draft={draft}
              setDraft={setDraft}
              onSend={sendPatientMessage}
              placeholder={
                selectedThread
                  ? `Message ${selectedThread.patientName}...`
                  : "Message..."
              }
            />
          </>
        ) : (
          <>
            <aside
              className={`min-h-0 flex-col border-gray-200 lg:flex lg:border-r ${
                showAdminThread ? "hidden lg:flex" : "flex"
              }`}
            >
              <div className="border-b border-gray-200 p-4">
                <p className="text-sm font-medium text-[#212529]">
                  Platform admin
                </p>
                <p className="text-xs text-gray-500">
                  Direct messages with PrimeCare admin
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminThread(true)}
                className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left ${
                  showAdminThread ? "bg-green-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                  AD
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-[#212529]">
                      PrimeCare Admin
                    </p>
                    {unreadAdminTotal > 0 ? (
                      <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {unreadAdminTotal}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-400">
                    {adminMessages.at(-1)?.content || "No messages yet"}
                  </p>
                </div>
              </button>
            </aside>

            <ThreadPane
              show={showAdminThread}
              onBack={() => setShowAdminThread(false)}
              title="PrimeCare Admin"
              subtitle="Platform operations"
              emptyDesktop={
                <AdminEmptyState
                  title="Admin chat"
                  description="Open the admin conversation to send a message."
                />
              }
              hasSelection={showAdminThread}
              messages={adminMessages.map((msg) => ({
                id: msg.id,
                mine: msg.senderRole === "doctor",
                content: msg.content,
                createdAt: msg.createdAt,
              }))}
              draft={draft}
              setDraft={setDraft}
              onSend={sendAdminMessage}
              placeholder="Message admin..."
            />
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-green-700 text-white"
          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
      {badge > 0 ? (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            active ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function ThreadPane({
  show,
  onBack,
  title,
  subtitle,
  emptyDesktop,
  hasSelection,
  messages,
  draft,
  setDraft,
  onSend,
  placeholder,
}: {
  show: boolean;
  onBack: () => void;
  title: string;
  subtitle: string;
  emptyDesktop: React.ReactNode;
  hasSelection: boolean;
  messages: {
    id: string;
    mine: boolean;
    content: string;
    createdAt: string;
  }[];
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  placeholder: string;
}) {
  return (
    <section
      className={`min-h-0 flex-col bg-white ${
        show
          ? "fixed inset-0 z-[60] flex lg:static lg:z-auto"
          : "hidden lg:flex"
      }`}
    >
      {!hasSelection ? (
        <div className="hidden flex-1 items-center justify-center p-6 lg:flex">
          {emptyDesktop}
        </div>
      ) : (
        <>
          <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 lg:pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 lg:hidden"
              onClick={onBack}
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#212529]">{title}</p>
              <p className="truncate text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">
                No messages yet. Start the conversation.
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm sm:max-w-[75%] ${
                      msg.mine
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-[#212529]"
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        msg.mine ? "text-green-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex shrink-0 gap-2 border-t border-gray-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend();
              }}
            />
            <Button
              className="shrink-0 bg-green-700 hover:bg-green-600"
              onClick={onSend}
              disabled={!draft.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
