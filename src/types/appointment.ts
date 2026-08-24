import type { BookingStatus } from "./common";

export type AppointmentPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  appointmentType: string;
  date: string;
  time: string;
  reason: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  doctorId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  appointmentType: string;
  date: string;
  time: string;
  reason: string;
  status: BookingStatus | string;
  rescheduleInfo?: { date: string; time: string };
  createdAt?: string;
  updatedAt?: string;
};

export type ReschedulePayload = {
  date: string;
  time: string;
};

export type UpdateAppointmentPayload = {
  status?: string;
  rescheduleInfo?: { date: string; time: string };
  doctorId?: string;
};
