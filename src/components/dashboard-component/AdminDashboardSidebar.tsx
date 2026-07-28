"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { adminNavItems, isAdminNavActive } from "@/components/admin/nav";

interface AdminDashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminDashboardSidebar({
  isOpen,
  onClose,
}: AdminDashboardSidebarProps) {
  const pathname = usePathname();

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1 px-3 py-4">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const active = isAdminNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active
                ? "border-r-2 border-green-700 bg-green-50 font-medium text-green-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-60 border-r border-gray-200 bg-white shadow-sm lg:block">
        <div className="px-5 pt-6">
          <Link href="/">
            <span className="text-xl font-bold md:text-2xl">prime</span>
            <span className="text-2xl font-extrabold text-green-700 md:text-3xl">
              Care
            </span>
          </Link>
          <p className="mt-1 text-xs text-gray-500">Super Admin</p>
        </div>
        <div className="h-[calc(100%-5rem)] overflow-y-auto">
          <NavLinks />
        </div>
      </aside>

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <Link href="/" onClick={onClose}>
            <span className="text-xl font-bold">prime</span>
            <span className="text-2xl font-extrabold text-green-700">Care</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <NavLinks onNavigate={onClose} />
      </aside>
    </>
  );
}
