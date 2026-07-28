export type StaffRole = "super_admin" | "doctor" | "support";

export type StaffMember = {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
  specialty: string;
  active: boolean;
  phone?: string;
  bio?: string;
};

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

export type BookingStatus =
  "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentRecord = {
  id: string;
  patientName: string;
  patientEmail: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  description: string;
  createdAt: string;
  chatEntitled?: boolean;
};

export type CatalogItem = {
  id: string;
  name: string;
  type: "specialty" | "urgent_care" | "service";
  price?: number;
  currency?: string;
  description: string;
  published: boolean;
};

export type ContentBlock = {
  id: string;
  key: string;
  title: string;
  body: string;
};

export type DoctorMessage = {
  id: string;
  senderId: string;
  senderRole: "super_admin" | "doctor";
  content: string;
  createdAt: string;
  read: boolean;
};

export type DoctorThread = {
  doctorId: string;
  messages: DoctorMessage[];
};
