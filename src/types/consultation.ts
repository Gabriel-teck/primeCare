import type { BookingStatus } from "./common";

export type ConsultationPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  date: string;
  time: string;
  reason: string;
  consultationType: string;
  file?: FileList;
};

export type Consultation = {
  id: string;
  patientId: string;
  doctorId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  consultationType: string;
  date: string;
  time: string;
  reason: string;
  status: BookingStatus | string;
  rescheduleInfo?: { date: string; time: string };
  fileUrl?: string;
  fileName?: string;
  googleMeetLink?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateConsultationPayload = {
  status?: string;
  rescheduleInfo?: { date: string; time: string };
  googleMeetLink?: string;
  doctorId?: string;
};
