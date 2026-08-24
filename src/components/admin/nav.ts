import {
  BarChart2,
  Calendar,
  Users,
  Stethoscope,
  MessageSquare,
  CreditCard,
  Layers,
  LineChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_BASE = "/admin-dashboard";

export const adminNavItems: AdminNavItem[] = [
  { label: "Overview", icon: BarChart2, href: ADMIN_BASE },
  { label: "Manage Bookings", icon: Calendar, href: `${ADMIN_BASE}/bookings` },
  { label: "Manage Patients", icon: Users, href: `${ADMIN_BASE}/patients` },
  { label: "Manage Staff", icon: Stethoscope, href: `${ADMIN_BASE}/staff` },
  { label: "Chat", icon: MessageSquare, href: `${ADMIN_BASE}/chat` },
  {
    label: "Manage Payments",
    icon: CreditCard,
    href: `${ADMIN_BASE}/payments`,
  },
  { label: "Manage Catalog", icon: Layers, href: `${ADMIN_BASE}/catalog` },
  { label: "Analytics", icon: LineChart, href: `${ADMIN_BASE}/analytics` },
  { label: "Settings", icon: Settings, href: `${ADMIN_BASE}/settings` },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === ADMIN_BASE) return pathname === ADMIN_BASE;
  return pathname === href || pathname.startsWith(`${href}/`);
}
