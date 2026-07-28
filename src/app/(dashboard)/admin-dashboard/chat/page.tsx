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
import { getActiveDoctors } from "@/lib/admin/mock-staff";
import { mockDoctorThreads } from "@/lib/admin/mock-data";
import type { DoctorMessage } from "@/lib/admin/types";

export default function AdminDoctorChatPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading chat…</p>}>
      <DoctorChatContent />
    </Suspense>
  );
}

function DoctorChatContent() {
  const searchParams = useSearchParams();
  const doctors = getActiveDoctors();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("doctorId"),
  );
  const [threads, setThreads] = useState(mockDoctorThreads);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const fromQuery = searchParams.get("doctorId");
    if (fromQuery) setSelectedId(fromQuery);
  }, [searchParams]);

  const filteredDoctors = useMemo(() => {
    const q = search.toLowerCase();
    return doctors.filter(
      (d) =>
        !q ||
        d.fullName.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q),
    );
  }, [doctors, search]);

  const selectedDoctor = doctors.find((d) => d.id === selectedId) || null;
  const messages =
    threads.find((t) => t.doctorId === selectedId)?.messages || [];
  const showThread = Boolean(selectedDoctor);

  const unreadFor = (doctorId: string) =>
    threads
      .find((t) => t.doctorId === doctorId)
      ?.messages.filter((m) => !m.read && m.senderRole === "doctor").length ||
    0;

  const lastPreview = (doctorId: string) => {
    const list = threads.find((t) => t.doctorId === doctorId)?.messages || [];
    return list.at(-1)?.content || "No messages yet";
  };

  const sendMessage = () => {
    if (!selectedId || !draft.trim()) return;
    const message: DoctorMessage = {
      id: `local-${Date.now()}`,
      senderId: "admin",
      senderRole: "super_admin",
      content: draft.trim(),
      createdAt: new Date().toISOString(),
      read: true,
    };
    setThreads((prev) => {
      const existing = prev.find((t) => t.doctorId === selectedId);
      if (existing) {
        return prev.map((t) =>
          t.doctorId === selectedId
            ? { ...t, messages: [...t.messages, message] }
            : t,
        );
      }
      return [...prev, { doctorId: selectedId, messages: [message] }];
    });
    setDraft("");
  };

  return (
    <div>
      <AdminPageHeader
        title="Doctor Chat"
        description="Message doctors on the platform. Select a doctor to start a direct conversation."
        className={showThread ? "hidden lg:flex" : undefined}
      />

      <div className="relative grid h-[calc(100dvh-8.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:h-[70vh] lg:grid-cols-[320px_1fr]">
        {/* Doctor list — hidden on mobile when a thread is open */}
        <aside
          className={`min-h-0 flex-col border-gray-200 lg:flex lg:border-r ${
            showThread ? "hidden" : "flex"
          }`}
        >
          <div className="border-b border-gray-200 p-3">
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search doctors..."
              label="Doctors"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {filteredDoctors.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No doctors found.</p>
            ) : (
              filteredDoctors.map((doctor) => {
                const unread = unreadFor(doctor.id);
                const active = selectedId === doctor.id;
                return (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => setSelectedId(doctor.id)}
                    className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors ${
                      active ? "bg-green-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                      {doctor.fullName
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-[#212529]">
                          {doctor.fullName}
                        </p>
                        {unread > 0 ? (
                          <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                            {unread}
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-gray-500">
                        {doctor.specialty}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {lastPreview(doctor.id)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Thread — full-screen sheet on mobile, pane on desktop */}
        <section
          className={`min-h-0 flex-col bg-white ${
            showThread
              ? "fixed inset-0 z-[60] flex lg:static lg:z-auto"
              : "hidden lg:flex"
          }`}
        >
          {!selectedDoctor ? (
            <div className="hidden flex-1 items-center justify-center p-6 lg:flex">
              <AdminEmptyState
                title="Select a doctor"
                description="Choose a doctor from the list to open or start a direct message."
              />
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 lg:pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 lg:hidden"
                  onClick={() => setSelectedId(null)}
                  aria-label="Back to doctors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#212529]">
                    {selectedDoctor.fullName}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {selectedDoctor.specialty} · {selectedDoctor.email}
                  </p>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No messages yet. Say hello to {selectedDoctor.fullName}.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const mine = msg.senderRole === "super_admin";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm sm:max-w-[75%] ${
                            mine
                              ? "bg-green-700 text-white"
                              : "bg-gray-100 text-[#212529]"
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p
                            className={`mt-1 text-[10px] ${
                              mine ? "text-green-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex shrink-0 gap-2 border-t border-gray-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${selectedDoctor.fullName}...`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <Button
                  className="shrink-0 bg-green-700 hover:bg-green-600"
                  onClick={sendMessage}
                  disabled={!draft.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
