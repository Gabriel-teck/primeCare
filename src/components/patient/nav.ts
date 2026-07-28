import {
  Grid,
  Video,
  Calendar,
  MessageSquare,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";

export type PatientNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const PATIENT_BASE = "/patient-dashboard";

export const patientNavItems: PatientNavItem[] = [
  { label: "Care Home", icon: Grid, href: PATIENT_BASE },
  {
    label: "Online Consultation",
    icon: Video,
    href: `${PATIENT_BASE}/consultation`,
  },
  {
    label: "Appointments",
    icon: Calendar,
    href: `${PATIENT_BASE}/appointment`,
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: `${PATIENT_BASE}/messages`,
  },
  {
    label: "My Care",
    icon: HeartPulse,
    href: `${PATIENT_BASE}/care`,
  },
];

export const patientPageTitles: Record<string, string> = {
  [PATIENT_BASE]: "Care Home",
  [`${PATIENT_BASE}/consultation`]: "Online Consultation",
  [`${PATIENT_BASE}/appointment`]: "Appointments",
  [`${PATIENT_BASE}/messages`]: "Messages",
  [`${PATIENT_BASE}/care`]: "My Care",
};

export function getPatientPageTitle(pathname: string) {
  if (patientPageTitles[pathname]) return patientPageTitles[pathname];
  if (pathname.startsWith(`${PATIENT_BASE}/care`)) return "My Care";
  return "Care Home";
}

export function isPatientNavActive(pathname: string, href: string) {
  if (href === PATIENT_BASE) return pathname === PATIENT_BASE;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const CHAT_ACCESS_KEY = "primecare-chat-access";
