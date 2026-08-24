"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AppointmentHistory from "@/components/custom/AppointmentHistory";
import AppointmentBookingForm from "@/components/custom/AppointmentBookingForm";
import { AdminPageHeader } from "@/components/admin";

export default function AppointmentPage() {
  const [tab, setTab] = useState("book");

  return (
    <div>
      <AdminPageHeader
        title="Appointments"
        description="Book clinic, follow-up, or general visits. For video care, use Online Consultation."
      />
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 flex w-full flex-row">
          <TabsTrigger value="book" className="flex-1">
            Book Appointment
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="book">
          <AppointmentBookingForm onSuccess={() => setTab("history")} />
        </TabsContent>
        <TabsContent value="history">
          <AppointmentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
