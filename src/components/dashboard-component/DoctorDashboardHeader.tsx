"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import DoctorDashboardSidebar from "./DoctorDashboardSidebar";

export default function DoctorDashboardHeader() {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user } = useAuth();
  const initials =
    user?.fullName
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR";

  return (
    <>
      <header className="fixed top-0 z-50 mx-auto flex w-full max-w-full items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-3 sm:px-8 lg:ml-60 lg:w-[calc(100%-15rem)]">
        <div className="shrink-0 lg:hidden">
          <button
            onClick={() => setShowSidebar((v) => !v)}
            className="cursor-pointer rounded-md p-2 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {showSidebar ? (
              <X className="h-6 w-6 text-[#1d884a]" />
            ) : (
              <Menu className="h-6 w-6 text-[#1d884a]" />
            )}
          </button>
        </div>

        <div className="hidden flex-1 lg:block" />

        <div className="ml-auto flex select-none items-center gap-2 px-1 pointer-events-none">
          <span className="hidden max-w-[160px] truncate text-sm font-semibold text-[#212529] sm:inline">
            {user?.fullName || "Doctor"}
          </span>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-green-100 text-green-700">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {showSidebar ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      ) : null}

      <DoctorDashboardSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
      />
    </>
  );
}
