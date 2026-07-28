"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import chat from "../../../../../public/assets/chat.webp";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/custom/ChatInterFace";
import PaymentModal from "@/components/modals/PaymentModal";
import { AdminPageHeader } from "@/components/admin";
import { CHAT_ACCESS_KEY } from "@/components/patient/nav";

export default function MessagesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setHasAccess(localStorage.getItem(CHAT_ACCESS_KEY) === "true");
    } catch {
      setHasAccess(false);
    }
    setReady(true);
  }, []);

  const handlePaymentSuccess = () => {
    try {
      localStorage.setItem(CHAT_ACCESS_KEY, "true");
    } catch {
      // ignore
    }
    setHasAccess(true);
  };

  if (!ready) {
    return <p className="text-sm text-gray-500">Loading messages…</p>;
  }

  if (hasAccess) {
    return (
      <div>
        <AdminPageHeader
          title="Messages"
          description="Chat with your PrimeCare care team. Text messages only for now."
        />
        <ChatInterface />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description="Unlock messaging with your care team for follow-ups between visits."
      />
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-8 p-6 md:flex-row md:justify-between md:p-10">
          <div className="w-full space-y-4 md:w-1/2">
            <h2 className="text-2xl font-semibold text-[#1d884a] md:text-3xl">
              Care team messaging
            </h2>
            <p className="text-base text-gray-700 md:text-lg">
              Message clinicians about symptoms, prescriptions, and visit
              follow-ups — without waiting for your next appointment.
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
              <li>One-time chat access unlock (demo): $25</li>
              <li>Text messaging with your care team</li>
              <li>Access stays on this device until you clear site data</li>
            </ul>
            <Button
              className="bg-green-700 hover:bg-green-600"
              onClick={() => setShowPaymentModal(true)}
            >
              Unlock chat access
            </Button>
          </div>
          <div className="w-full max-w-[420px] md:w-1/2">
            <Image
              src={chat}
              alt="Care team chat"
              width={533}
              height={533}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </section>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
