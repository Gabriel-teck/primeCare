"use client";

import UserDashoardSidebar from "./UserDashboardSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Bell, Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function UserDashoardHeader() {
  const [showSidebar, setShowSidebar] = useState(false);
  const pathname = usePathname();

  // Mapping of paths to page names
  const getPageName = (path: string) => {
    const pageMap: { [key: string]: string } = {
      "/patient-dashboard": "Dashboard",
      "/patient-dashboard/consultation": "Consultation",
      "/patient-dashboard/appointment": "Appointment",
      "/patient-dashboard/messages": "Messages",
      "/patient-dashboard/paymenthistory": "Payment History",
    };

    return pageMap[path] || "Dashboard";
  };

  const currentPageName = getPageName(pathname);

  return (
    <>
      <header className="mx-auto fixed top-0 z-50 w-full lg:w-[calc(100%-15rem)] flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 lg:ml-60">
        <div className="lg:hidden">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-md transition-colors cursor-pointer hover:bg-gray-100"
          >
            {showSidebar ? (
              <X className="w-6 h-6 text-[#1d884a]" />
            ) : (
              <Menu className="w-6 h-6 text-[#1d884a]" />
            )}
          </button>
        </div>

        {/* Desktop logo and page name - hidden on mobile */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="text-[20px] font-semibold text-[#212529]">
            {currentPageName}
          </div>
        </div>

        {/* Mobile page name - visible only on mobile */}
        <div className="lg:hidden flex-1 text-center">
          <h1 className="text-lg font-semibold text-[#14d">
            {currentPageName}
          </h1>
        </div>

        {/* Right side header content */}
        <div className="hidden md:flex gap-4">
            <Button size="lg" variant="default" className="bg-green-700 hover:bg-green-600">Urgent care</Button>
            <Button size="lg" variant="default" className="bg-green-700 hover:bg-green-600">Book now</Button>
        </div>
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>

        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <UserDashoardSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
        />
      </header>
    </>
  );
}
