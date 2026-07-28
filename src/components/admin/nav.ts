import {
  BarChart2,
  Calendar,
  Users,
  Stethoscope,
  MessageSquare,
  CreditCard,
  Layers,
  FileText,
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
  { label: "Bookings", icon: Calendar, href: `${ADMIN_BASE}/bookings` },
  { label: "Patients", icon: Users, href: `${ADMIN_BASE}/patients` },
  { label: "Staff", icon: Stethoscope, href: `${ADMIN_BASE}/staff` },
  { label: "Chat", icon: MessageSquare, href: `${ADMIN_BASE}/chat` },
  { label: "Payments", icon: CreditCard, href: `${ADMIN_BASE}/payments` },
  { label: "Catalog", icon: Layers, href: `${ADMIN_BASE}/catalog` },
  { label: "Content", icon: FileText, href: `${ADMIN_BASE}/content` },
  { label: "Analytics", icon: LineChart, href: `${ADMIN_BASE}/analytics` },
  { label: "Settings", icon: Settings, href: `${ADMIN_BASE}/settings` },
];

export const adminPageTitles: Record<string, string> = {
  [ADMIN_BASE]: "Overview",
  [`${ADMIN_BASE}/bookings`]: "Bookings",
  [`${ADMIN_BASE}/patients`]: "Patients",
  [`${ADMIN_BASE}/staff`]: "Staff",
  [`${ADMIN_BASE}/chat`]: "Doctor Chat",
  [`${ADMIN_BASE}/payments`]: "Payments",
  [`${ADMIN_BASE}/catalog`]: "Catalog",
  [`${ADMIN_BASE}/content`]: "Content",
  [`${ADMIN_BASE}/analytics`]: "Analytics",
  [`${ADMIN_BASE}/settings`]: "Settings",
};

export function getAdminPageTitle(pathname: string) {
  if (adminPageTitles[pathname]) return adminPageTitles[pathname];
  if (pathname.startsWith(`${ADMIN_BASE}/bookings/`)) return "Booking detail";
  if (pathname.startsWith(`${ADMIN_BASE}/patients/`)) return "Patient detail";
  if (pathname.startsWith(`${ADMIN_BASE}/staff/`)) return "Staff detail";
  return "Admin";
}

export function isAdminNavActive(pathname: string, href: string) {
  if (href === ADMIN_BASE) return pathname === ADMIN_BASE;
  return pathname === href || pathname.startsWith(`${href}/`);
}
