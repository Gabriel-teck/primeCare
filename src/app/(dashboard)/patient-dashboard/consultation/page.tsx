"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ConsultationBookingForm from "@/components/custom/ConsultationBookingForm";
import ConsultationHistory from "@/components/custom/ConsultationHistory";
import { AdminPageHeader } from "@/components/admin";

export default function ConsultationPage() {
  const [tab, setTab] = useState("book");

  return (
    <div>
      <AdminPageHeader
        title="Online Consultation"
        description="Book a video or voice visit with a clinician. Different from in-person appointments — start the call type you booked once confirmed."
      />
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 flex w-full flex-row">
          <TabsTrigger value="book" className="flex-1">
            Book Online Consultation
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="book">
          <ConsultationBookingForm onSuccess={() => setTab("history")} />
        </TabsContent>
        <TabsContent value="history">
          <ConsultationHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
