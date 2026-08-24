import type { AdminBooking } from "@/lib/admin/types";
import type { Appointment } from "@/types";
import type { Consultation } from "@/types";

export function mapDoctorBookings(
  appointments: Appointment[] = [],
  consultations: Consultation[] = [],
): AdminBooking[] {
  return [
    ...appointments.map((a) => ({
      id: a.id,
      fullName: a.fullName,
      email: a.email,
      phoneNumber: a.phoneNumber,
      date: a.date,
      time: a.time,
      status: String(a.status),
      reason: a.reason,
      kind: "appointment" as const,
      typeLabel: a.appointmentType || "appointment",
    })),
    ...consultations.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phoneNumber: c.phoneNumber,
      date: c.date,
      time: c.time,
      status: String(c.status),
      reason: c.reason,
      kind: "consultation" as const,
      typeLabel: c.consultationType || "consultation",
      googleMeetLink: c.googleMeetLink,
      fileName: c.fileName,
      fileUrl: c.fileUrl,
    })),
  ].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
}

export function bookingRouteId(row: AdminBooking) {
  return `${row.kind}-${row.id}`;
}

export function parseBookingRouteId(raw: string): {
  kind: "appointment" | "consultation";
  id: string;
} | null {
  if (raw.startsWith("appointment-")) {
    return { kind: "appointment", id: raw.slice("appointment-".length) };
  }
  if (raw.startsWith("consultation-")) {
    return { kind: "consultation", id: raw.slice("consultation-".length) };
  }
  return null;
}
