"use client";

import AdminDashoardSidebar from "./AdminDashboardSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState } from "react";
import { X, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminDashoardHeader() {
  const [showSidebar, setShowSidebar] = useState(false);
  const pathname = usePathname();

  // Mapping of paths to page names
  const getPageName = (path: string) => {
    const pageMap: { [key: string]: string } = {
      "/admin-dashboard": "Admin Dashboard",
      "/admin-dashboard/admin-appointments": "Appointments",
      "/admin-dashboard/admin-chats": "Messages and Chats",
      "/admin-dashboard/admin-patients": "Patient History",
    };

    return pageMap[path] || "Admin Dashboard";
  };

  const currentPageName = getPageName(pathname);

  return (
    <>
      <header className="mx-auto fixed top-0 z-50 w-full lg:w-[calc(100%-15rem)] flex items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-12 py-3 lg:ml-60">
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

        <div className="flex items-center gap-6">
          <div className="hidden lg:block text-[20px] font-semibold text-[#212529] ">
            <h2>Dr Gabriel</h2>
          </div>
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
        <AdminDashoardSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
        />
      </header>
    </>
  );
}
