"use client";

import {
  Grid,
  Calendar,
  MessageSquare,
  CreditCard,
  Stethoscope,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserDashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function UserDashoardSidebar({
  isOpen,
  onClose,
}: UserDashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/patient-dashboard", icon: Grid, label: "Dashboard" },
    {
      href: "/patient-dashboard/consultation",
      icon: Stethoscope,
      label: "Consultation",
    },
    {
      href: "/patient-dashboard/appointment",
      icon: Calendar,
      label: "Appointment",
    },
    {
      href: "/patient-dashboard/messages",
      icon: MessageSquare,
      label: "Messages",
    },
    {
      href: "/patient-dashboard/paymenthistory",
      icon: CreditCard,
      label: "Payment History",
    },
  ];

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-60 bg-white shadow-sm border-r border-gray-200 z-30">
        <div className="flex text-shadow-lg pl-6 pt-6">
          <Link href="/">
            <span className="text-xl md:text-2xl font-bold">prime</span>
            <span className="text-2xl md:text-3xl font-extrabold text-green-700">
              Care
            </span>
          </Link>
        </div>
        <nav className="h-full py-8 px-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex px-4 py-3 gap-4 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700 border-r-2 border-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex text-shadow-lg">
            <Link href="/" onClick={handleLinkClick}>
              <span className="text-xl font-bold">prime</span>
              <span className="text-2xl font-extrabold text-green-700">
                Care
              </span>
            </Link>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="py-4 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex px-4 py-3 gap-4 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
