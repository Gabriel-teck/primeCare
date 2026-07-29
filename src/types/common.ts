export type ApiRole = "patient" | "doctor" | "admin" | "super_admin";

export type BookingStatus =
  "pending" | "confirmed" | "cancelled" | "rescheduled" | "completed";

export type MessageResponse = {
  message: string;
};
