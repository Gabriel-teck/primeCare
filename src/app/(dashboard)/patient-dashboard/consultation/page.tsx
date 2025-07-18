"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ConsultationBookingForm from "@/components/custom/ConsultationBookingForm";
import ConsultationHistory from "@/components/custom/ConsultationHistory";

export default function ConsultationPage() {
  const [tab, setTab] = useState("book");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-2 sm:px-4 lg:px-8 lg:mt-12">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full flex flex-row mb-6">
            <TabsTrigger value="book" className="flex-1">
              Book Consultation
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              Consultation History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="book">
            <ConsultationBookingForm onSuccess={()=>setTab("history")}/>
          </TabsContent>
          <TabsContent value="history">
            <ConsultationHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
