"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AppointmentHistory from "@/components/custom/AppointmentHistory";
import AppointmentBookingForm from "@/components/custom/AppointmentBookingForm";

export default function AppointmentPage() {
  const [tab, setTab] = useState("book");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-2 sm:px-4 lg:px-8 lg:mt-12">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full flex flex-row mb-6">
            <TabsTrigger value="book" className="flex-1">
              Create an Appointment
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              Appointment History
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
    </div>
  );
}
