export type AdminBooking = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
  kind: "appointment" | "consultation";
  typeLabel: string;
  googleMeetLink?: string;
  fileName?: string;
  fileUrl?: string;
};
