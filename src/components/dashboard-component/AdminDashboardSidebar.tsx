"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { adminNavItems, isAdminNavActive } from "@/components/admin/nav";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { useUnreadBadge } from "@/hooks/useUnreadBadge";
import { useAuth } from "@/context/AuthContext";

interface AdminDashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminDashboardSidebar({
  isOpen,
  onClose,
}: AdminDashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { count: unreadMessages } = useUnreadBadge();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    onClose?.();
    setLogoutOpen(false);
    logout();
    router.push("/login");
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex h-full flex-col px-3 py-4">
      <div className="space-y-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const active = isAdminNavActive(pathname, item.href);
          const showBadge = item.href.endsWith("/chat") && unreadMessages > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-green-50 font-medium text-green-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge ? (
                <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {unreadMessages}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setLogoutOpen(true)}
        className="mt-auto flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        <span>Log out</span>
      </button>
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
        </div>
        <div className="h-[calc(100%-5rem)]">
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
        <div className="h-[calc(100%-4.5rem)]">
          <NavLinks onNavigate={onClose} />
        </div>
      </aside>

      <ConfirmModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out"
        description="Are you sure you want to logout?"
        cancelLabel="Cancel"
        confirmLabel="Confirm"
        variant="default"
        icon={<LogOut className="h-6 w-6 text-green-700" aria-hidden />}
        onConfirm={handleLogout}
      />
    </>
  );
}
