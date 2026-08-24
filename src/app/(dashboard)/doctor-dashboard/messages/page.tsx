"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminSearchInput,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatPeerStatus } from "@/components/chat/ChatPeerStatus";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  createConversation,
  listConversations,
  markConversationRead,
} from "@/lib/api/chat";
import { getDoctorAppointments } from "@/lib/api/appointment";
import { getDoctorConsultations } from "@/lib/api/consultation";
import { useMessageCache } from "@/hooks/useMessageCache";
import { usePeerPresence, useTypingIndicator } from "@/hooks/useChatPresence";
import { useUnreadBadge } from "@/hooks/useUnreadBadge";
import type { ChatMessage, Conversation } from "@/types";
import { toast } from "sonner";

type Tab = "patients" | "admin";

type PatientContact = {
  patientId: string;
  patientName: string;
  patientEmail: string;
  conversationId?: string;
  preview?: string;
  unreadCount?: number;
};

export default function DoctorMessagesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <DoctorMessagesContent />
    </Suspense>
  );
}

function DoctorMessagesContent() {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const { refresh: refreshUnread } = useUnreadBadge();
  const cache = useMessageCache(token);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "admin" ? "admin" : "patients";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<PatientContact[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    searchParams.get("patientId") || searchParams.get("conversationId"),
  );
  const [showAdminThread, setShowAdminThread] = useState(
    searchParams.get("tab") === "admin",
  );
  const [adminConversationId, setAdminConversationId] = useState<string | null>(
    null,
  );
  const [adminPreview, setAdminPreview] = useState("No messages yet");
  const [adminUnread, setAdminUnread] = useState(0);
  const [adminPeerId, setAdminPeerId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);

  const peerId = tab === "admin" ? adminPeerId : selectedPatientId || null;
  const online = usePeerPresence(peerId);
  const { peerTyping, emitTyping } = useTypingIndicator(activeConversationId);

  const applyConversations = useCallback((convos: Conversation[]) => {
    const patientConvos = (convos || []).filter(
      (c) => c.type === "DOCTOR_PATIENT",
    );
    const adminConvo = (convos || []).find((c) => c.type === "DOCTOR_ADMIN");
    setAdminConversationId(adminConvo?.id || null);
    setAdminPreview(adminConvo?.messages?.[0]?.content || "No messages yet");
    setAdminUnread(adminConvo?.unreadCount || 0);
    setAdminPeerId(adminConvo?.peer?.id || adminConvo?.adminId || null);
    return { patientConvos, adminConvo };
  }, []);

  const loadLists = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      const [convos, appts, consults] = await Promise.all([
        listConversations(token),
        getDoctorAppointments(token),
        getDoctorConsultations(token),
      ]);

      const { patientConvos } = applyConversations(convos || []);
      await cache.preloadMany((convos || []).map((c) => c.id));

      const byPatient = new Map<string, PatientContact>();

      patientConvos.forEach((c) => {
        if (!c.patientId) return;
        byPatient.set(c.patientId, {
          patientId: c.patientId,
          patientName: c.peer?.fullName || "Patient",
          patientEmail: c.peer?.email || "",
          conversationId: c.id,
          preview: c.messages?.[0]?.content || "No messages yet",
          unreadCount: c.unreadCount || 0,
        });
      });

      [...(appts || []), ...(consults || [])].forEach(
        (row: { patientId?: string; fullName: string; email: string }) => {
          const id = row.patientId;
          if (!id || byPatient.has(id)) return;
          byPatient.set(id, {
            patientId: id,
            patientName: row.fullName,
            patientEmail: row.email,
            preview: "No messages yet",
            unreadCount: 0,
          });
        },
      );

      setContacts([...byPatient.values()]);
    } catch {
      toast.error("Failed to load messages");
      setContacts([]);
    } finally {
      setLoadingList(false);
    }
  }, [token, cache, applyConversations]);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  useEffect(() => {
    const nextTab = searchParams.get("tab") === "admin" ? "admin" : "patients";
    setTab(nextTab);
    const patientId =
      searchParams.get("patientId") || searchParams.get("conversationId");
    if (patientId) {
      setSelectedPatientId(patientId);
      setTab("patients");
    }
    if (nextTab === "admin") setShowAdminThread(true);
  }, [searchParams]);

  const openThread = useCallback(
    async (conversationId: string) => {
      if (!token) return;
      setActiveConversationId(conversationId);
      const cached = cache.getCached(conversationId);
      if (cached) {
        setMessages(cached);
        setLoadingThread(false);
      } else {
        setLoadingThread(true);
      }
      socket?.emit("joinConversation", { conversationId });
      void markConversationRead(conversationId, token).then(() =>
        refreshUnread(),
      );
      setContacts((prev) =>
        prev.map((c) =>
          c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      );
      if (conversationId === adminConversationId) setAdminUnread(0);
      if (!cached) {
        try {
          await cache.preloadMany([conversationId]);
          setMessages(cache.getCached(conversationId) || []);
        } catch {
          toast.error("Failed to load messages");
          setMessages([]);
        } finally {
          setLoadingThread(false);
        }
      }
    },
    [token, socket, cache, refreshUnread, adminConversationId],
  );

  useEffect(() => {
    if (!token || tab !== "patients" || !selectedPatientId) return;
    let cancelled = false;
    const run = async () => {
      try {
        const existing = contacts.find(
          (c) => c.patientId === selectedPatientId,
        )?.conversationId;
        if (existing && activeConversationId === existing) {
          const cached = cache.getCached(existing);
          if (cached) setMessages(cached);
          return;
        }
        const convo =
          existing ||
          (
            await createConversation(
              { type: "DOCTOR_PATIENT", patientId: selectedPatientId },
              token,
            )
          ).id;
        if (cancelled) return;
        if (!existing) {
          cache.setCached(convo, []);
          await loadLists();
        }
        await openThread(convo);
      } catch {
        if (!cancelled) toast.error("Could not open patient chat");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab, selectedPatientId]);

  useEffect(() => {
    if (!token || tab !== "admin" || !showAdminThread) return;
    let cancelled = false;
    const run = async () => {
      try {
        const convo =
          adminConversationId ||
          (await createConversation({ type: "DOCTOR_ADMIN" }, token)).id;
        if (cancelled) return;
        if (!adminConversationId) {
          setAdminConversationId(convo);
          cache.setCached(convo, []);
          await loadLists();
        }
        await openThread(convo);
      } catch {
        if (!cancelled) toast.error("Could not open admin chat");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab, showAdminThread]);

  useEffect(() => {
    if (!socket) return;
    const onReceive = (message: ChatMessage) => {
      if (message.conversationId) {
        cache.appendCached(message.conversationId, message);
      }
      if (message.conversationId !== activeConversationId) {
        if (message.conversationId === adminConversationId) {
          setAdminUnread((n) => n + 1);
          setAdminPreview(message.content);
        } else {
          setContacts((prev) =>
            prev.map((c) =>
              c.conversationId === message.conversationId
                ? {
                    ...c,
                    unreadCount: (c.unreadCount || 0) + 1,
                    preview: message.content,
                  }
                : c,
            ),
          );
        }
        void refreshUnread();
        return;
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev.filter((m) => !m.id.startsWith("temp-")), message];
      });
      void markConversationRead(activeConversationId, token).then(() =>
        refreshUnread(),
      );
    };
    socket.on("receiveMessage", onReceive);
    return () => {
      socket.off("receiveMessage", onReceive);
    };
  }, [
    socket,
    activeConversationId,
    adminConversationId,
    cache,
    token,
    refreshUnread,
  ]);

  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter(
      (t) =>
        !q ||
        t.patientName.toLowerCase().includes(q) ||
        t.patientEmail.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const selectedContact =
    contacts.find((t) => t.patientId === selectedPatientId) || null;

  const showPatientThread = tab === "patients" && Boolean(selectedContact);
  const showThread = tab === "admin" ? showAdminThread : showPatientThread;

  const unreadPatientTotal = contacts.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  const send = () => {
    if (!activeConversationId || !draft.trim() || !socket) return;
    const content = draft.trim();
    setDraft("");
    emitTyping(false);
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      content,
      sender: "doctor",
      senderId: user?.id,
      createdAt: new Date().toISOString(),
      conversationId: activeConversationId,
    };
    setMessages((prev) => [...prev, tempMsg]);
    cache.appendCached(activeConversationId, tempMsg);
    socket.emit("sendMessage", {
      conversationId: activeConversationId,
      content,
    });
  };

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
            emitTyping(false);
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
            emitTyping(false);
          }}
          label="Admin"
          badge={adminUnread}
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
                {loadingList ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1d884a]" />
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">
                    No patients to message yet. Assigned bookings will appear
                    here.
                  </p>
                ) : (
                  filteredContacts.map((thread) => {
                    const active = selectedPatientId === thread.patientId;
                    const unread = thread.unreadCount || 0;
                    return (
                      <button
                        key={thread.patientId}
                        type="button"
                        onClick={() => setSelectedPatientId(thread.patientId)}
                        className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors ${
                          active ? "bg-green-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <Avatar initials={initials(thread.patientName)} />
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
                            {thread.preview}
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
              onBack={() => {
                setSelectedPatientId(null);
                emitTyping(false);
              }}
              title={selectedContact?.patientName || ""}
              status={<ChatPeerStatus online={online} typing={peerTyping} />}
              emptyDesktop={
                <AdminEmptyState
                  title="Select a patient"
                  description="Choose a conversation to reply to a patient."
                />
              }
              hasSelection={Boolean(selectedContact)}
              loading={loadingThread}
              messages={mapMessages(messages, user?.id, "doctor")}
              draft={draft}
              setDraft={(v) => {
                setDraft(v);
                emitTyping(Boolean(v.trim()));
              }}
              onSend={send}
              placeholder={
                selectedContact
                  ? `Message ${selectedContact.patientName}...`
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
                <Avatar initials="AD" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-[#212529]">
                      PrimeCare Admin
                    </p>
                    {adminUnread > 0 ? (
                      <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {adminUnread}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-400">
                    {adminPreview}
                  </p>
                </div>
              </button>
            </aside>

            <ThreadPane
              show={showAdminThread}
              onBack={() => {
                setShowAdminThread(false);
                emitTyping(false);
              }}
              title="PrimeCare Admin"
              status={<ChatPeerStatus online={online} typing={peerTyping} />}
              emptyDesktop={
                <AdminEmptyState
                  title="Admin chat"
                  description="Open the admin conversation to send a message."
                />
              }
              hasSelection={showAdminThread}
              loading={loadingThread}
              messages={mapMessages(messages, user?.id, "doctor")}
              draft={draft}
              setDraft={(v) => {
                setDraft(v);
                emitTyping(Boolean(v.trim()));
              }}
              onSend={send}
              placeholder="Message admin..."
            />
          </>
        )}
      </div>
    </div>
  );
}

function mapMessages(
  messages: ChatMessage[],
  userId: string | undefined,
  myRole: string,
) {
  return messages.map((msg) => ({
    id: msg.id,
    mine: msg.senderId === userId || msg.sender === myRole,
    content: msg.content,
    createdAt: msg.createdAt,
  }));
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

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
      {initials}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ThreadPane({
  show,
  onBack,
  title,
  status,
  emptyDesktop,
  hasSelection,
  loading,
  messages,
  draft,
  setDraft,
  onSend,
  placeholder,
}: {
  show: boolean;
  onBack: () => void;
  title: string;
  status: React.ReactNode;
  emptyDesktop: React.ReactNode;
  hasSelection: boolean;
  loading: boolean;
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
              {status}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#1d884a]" />
              </div>
            ) : messages.length === 0 ? (
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
