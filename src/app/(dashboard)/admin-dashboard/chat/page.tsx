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
import { listStaff } from "@/lib/api/staff";
import { useMessageCache } from "@/hooks/useMessageCache";
import { usePeerPresence, useTypingIndicator } from "@/hooks/useChatPresence";
import { useUnreadBadge } from "@/hooks/useUnreadBadge";
import type { ChatMessage, Conversation, StaffMember } from "@/types";
import { toast } from "sonner";

type Tab = "doctors" | "patients";

export default function AdminDoctorChatPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading chat…</p>}>
      <DoctorChatContent />
    </Suspense>
  );
}

function DoctorChatContent() {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const { refresh: refreshUnread } = useUnreadBadge();
  const cache = useMessageCache(token);
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("doctors");
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(
    searchParams.get("doctorId"),
  );
  const [selectedPatientConvId, setSelectedPatientConvId] = useState<
    string | null
  >(null);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);

  const peerId = useMemo(() => {
    if (tab === "doctors") return selectedDoctorId;
    return (
      conversations.find((c) => c.id === selectedPatientConvId)?.peer?.id ||
      null
    );
  }, [tab, selectedDoctorId, selectedPatientConvId, conversations]);

  const online = usePeerPresence(peerId);
  const { peerTyping, emitTyping } = useTypingIndicator(activeConversationId);

  const loadLists = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      const [staff, convos] = await Promise.all([
        listStaff(token, { role: "doctor", status: "active" }),
        listConversations(token),
      ]);
      setDoctors(staff || []);
      setConversations(convos || []);
      await cache.preloadMany((convos || []).map((c) => c.id));
    } catch {
      toast.error("Failed to load chat");
      setDoctors([]);
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  }, [token, cache]);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  useEffect(() => {
    const fromQuery = searchParams.get("doctorId");
    if (fromQuery) {
      setTab("doctors");
      setSelectedDoctorId(fromQuery);
    }
  }, [searchParams]);

  const doctorConversations = useMemo(
    () => conversations.filter((c) => c.type === "DOCTOR_ADMIN"),
    [conversations],
  );
  const patientConversations = useMemo(
    () => conversations.filter((c) => c.type === "PATIENT_CARE"),
    [conversations],
  );

  const convoByDoctorId = useMemo(() => {
    const map = new Map<string, Conversation>();
    doctorConversations.forEach((c) => {
      if (c.doctorId) map.set(c.doctorId, c);
    });
    return map;
  }, [doctorConversations]);

  const filteredDoctors = useMemo(() => {
    const q = search.toLowerCase();
    return doctors.filter(
      (d) =>
        !q ||
        d.fullName.toLowerCase().includes(q) ||
        (d.specialty || "").toLowerCase().includes(q),
    );
  }, [doctors, search]);

  const filteredPatientConvos = useMemo(() => {
    const q = search.toLowerCase();
    return patientConversations.filter(
      (c) =>
        !q ||
        c.peer?.fullName.toLowerCase().includes(q) ||
        c.peer?.email.toLowerCase().includes(q),
    );
  }, [patientConversations, search]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || null;
  const selectedPatientConvo =
    patientConversations.find((c) => c.id === selectedPatientConvId) || null;

  const showThread =
    tab === "doctors" ? Boolean(selectedDoctor) : Boolean(selectedPatientConvo);

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
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      );
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
    [token, socket, cache, refreshUnread],
  );

  useEffect(() => {
    if (!token || tab !== "doctors" || !selectedDoctorId) return;
    let cancelled = false;
    const run = async () => {
      try {
        const existing = convoByDoctorId.get(selectedDoctorId);
        if (existing && activeConversationId === existing.id) {
          const cached = cache.getCached(existing.id);
          if (cached) setMessages(cached);
          return;
        }
        const convo =
          existing ||
          (await createConversation(
            { type: "DOCTOR_ADMIN", doctorId: selectedDoctorId },
            token,
          ));
        if (cancelled) return;
        if (!existing) {
          cache.setCached(convo.id, []);
          const refreshed = await listConversations(token);
          if (cancelled) return;
          setConversations(refreshed || []);
          await cache.preloadMany((refreshed || []).map((c) => c.id));
        }
        await openThread(convo.id);
      } catch {
        if (!cancelled) toast.error("Could not open doctor chat");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab, selectedDoctorId]);

  useEffect(() => {
    if (!token || tab !== "patients" || !selectedPatientConvId) return;
    void openThread(selectedPatientConvId);
  }, [token, tab, selectedPatientConvId, openThread]);

  useEffect(() => {
    if (!socket) return;
    const onReceive = (message: ChatMessage) => {
      if (message.conversationId) {
        cache.appendCached(message.conversationId, message);
      }
      if (message.conversationId !== activeConversationId) {
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
  }, [socket, activeConversationId, cache, token, refreshUnread]);

  const send = () => {
    if (!activeConversationId || !draft.trim() || !socket) return;
    const content = draft.trim();
    setDraft("");
    emitTyping(false);
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      content,
      sender: "admin",
      senderId: user?.id,
      createdAt: new Date().toISOString(),
      conversationId: activeConversationId,
    };
    setMessages((prev) => [...prev, tempMsg]);
    cache.appendCached(activeConversationId, tempMsg);
    socket.emit(
      "sendMessage",
      { conversationId: activeConversationId, content },
      () => setSending(false),
    );
    setSending(false);
  };

  const lastPreviewForDoctor = (doctorId: string) =>
    convoByDoctorId.get(doctorId)?.messages?.[0]?.content || "No messages yet";

  const unreadForDoctor = (doctorId: string) =>
    convoByDoctorId.get(doctorId)?.unreadCount || 0;

  const patientUnreadTotal = patientConversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  return (
    <div>
      <AdminPageHeader
        title="Chat"
        description="Message doctors and patients on the care team."
        className={showThread ? "hidden lg:flex" : undefined}
      />

      <div className="mb-3 flex gap-2">
        <TabButton
          active={tab === "doctors"}
          label="Doctors"
          onClick={() => {
            setTab("doctors");
            setSelectedPatientConvId(null);
            setMessages([]);
            setActiveConversationId(null);
            emitTyping(false);
          }}
        />
        <TabButton
          active={tab === "patients"}
          label="Patients"
          badge={patientUnreadTotal}
          onClick={() => {
            setTab("patients");
            setSelectedDoctorId(null);
            setMessages([]);
            setActiveConversationId(null);
            emitTyping(false);
          }}
        />
      </div>

      <div className="relative grid h-[calc(100dvh-10rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:h-[70vh] lg:grid-cols-[320px_1fr]">
        <aside
          className={`min-h-0 flex-col border-gray-200 lg:flex lg:border-r ${
            showThread ? "hidden" : "flex"
          }`}
        >
          <div className="border-b border-gray-200 p-3">
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder={
                tab === "doctors" ? "Search doctors..." : "Search patients..."
              }
              label={tab === "doctors" ? "Doctors" : "Patients"}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#1d884a]" />
              </div>
            ) : tab === "doctors" ? (
              filteredDoctors.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No doctors found.</p>
              ) : (
                filteredDoctors.map((doctor) => {
                  const unread = unreadForDoctor(doctor.id);
                  const active = selectedDoctorId === doctor.id;
                  return (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => setSelectedDoctorId(doctor.id)}
                      className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors ${
                        active ? "bg-green-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <Avatar initials={initials(doctor.fullName)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium text-[#212529]">
                            {doctor.fullName}
                          </p>
                          {unread > 0 ? <UnreadBadge count={unread} /> : null}
                        </div>
                        <p className="truncate text-xs text-gray-500">
                          {doctor.specialty || "Doctor"}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-400">
                          {lastPreviewForDoctor(doctor.id)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )
            ) : filteredPatientConvos.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No patient chats yet.</p>
            ) : (
              filteredPatientConvos.map((convo) => {
                const active = selectedPatientConvId === convo.id;
                const last = convo.messages?.[0];
                const unread = convo.unreadCount || 0;
                return (
                  <button
                    key={convo.id}
                    type="button"
                    onClick={() => setSelectedPatientConvId(convo.id)}
                    className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors ${
                      active ? "bg-green-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <Avatar initials={initials(convo.peer?.fullName || "P")} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-[#212529]">
                          {convo.peer?.fullName || "Patient"}
                        </p>
                        {unread > 0 ? <UnreadBadge count={unread} /> : null}
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {last?.content || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <ThreadPane
          show={showThread}
          onBack={() => {
            setSelectedDoctorId(null);
            setSelectedPatientConvId(null);
            setActiveConversationId(null);
            setMessages([]);
            emitTyping(false);
          }}
          title={
            tab === "doctors"
              ? selectedDoctor?.fullName || ""
              : selectedPatientConvo?.peer?.fullName || "Patient"
          }
          status={<ChatPeerStatus online={online} typing={peerTyping} />}
          emptyDesktop={
            <AdminEmptyState
              title={tab === "doctors" ? "Select a doctor" : "Select a patient"}
              description={
                tab === "doctors"
                  ? "Choose a doctor from the list to open or start a direct message."
                  : "Choose a patient care conversation to reply."
              }
            />
          }
          hasSelection={showThread}
          loading={loadingThread}
          messages={messages.map((msg) => ({
            id: msg.id,
            mine: msg.senderId === user?.id || msg.sender === "admin",
            content: msg.content,
            createdAt: msg.createdAt,
          }))}
          draft={draft}
          setDraft={(v) => {
            setDraft(v);
            emitTyping(Boolean(v.trim()));
          }}
          onSend={send}
          sending={sending}
          placeholder={
            tab === "doctors"
              ? selectedDoctor
                ? `Message ${selectedDoctor.fullName}...`
                : "Message..."
              : "Reply to patient..."
          }
        />
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
  badge?: number;
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
      {badge && badge > 0 ? (
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

function UnreadBadge({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-semibold text-white">
      {count}
    </span>
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
  sending,
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
  sending: boolean;
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
              disabled={!draft.trim() || sending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
