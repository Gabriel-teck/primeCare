"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import DoctorDashboardSidebar from "./DoctorDashboardSidebar";

export default function DoctorDashboardHeader() {
  const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const initials =
    user?.fullName
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="ml-auto flex items-center gap-2 px-2 hover:bg-green-50"
            >
              <span className="hidden max-w-[160px] truncate text-sm font-semibold text-[#212529] sm:inline">
                {user?.fullName || "Doctor"}
              </span>
              {/* <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-green-100 text-green-700">
                  {initials}
                </AvatarFallback>
              </Avatar> */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user?.fullName || "Doctor"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/doctor-dashboard/settings")}
            >
              <User className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
