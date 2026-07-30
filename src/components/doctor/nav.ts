import {
  BarChart2,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type DoctorNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const DOCTOR_BASE = "/doctor-dashboard";

export const doctorNavItems: DoctorNavItem[] = [
  { label: "Overview", icon: BarChart2, href: DOCTOR_BASE },
  { label: "Schedule", icon: Calendar, href: `${DOCTOR_BASE}/schedule` },
  { label: "Patients", icon: Users, href: `${DOCTOR_BASE}/patients` },
  { label: "Messages", icon: MessageSquare, href: `${DOCTOR_BASE}/messages` },
  { label: "Settings", icon: Settings, href: `${DOCTOR_BASE}/settings` },
];

export function isDoctorNavActive(pathname: string, href: string) {
  if (href === DOCTOR_BASE) return pathname === DOCTOR_BASE;
  return pathname === href || pathname.startsWith(`${href}/`);
}
