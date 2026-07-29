import { api } from "./client";
import type {
  Appointment,
  AppointmentPayload,
  ReschedulePayload,
  UpdateAppointmentPayload,
} from "@/types";

export type { AppointmentPayload } from "@/types";

export async function bookAppointment(
  data: AppointmentPayload,
  token: string | null,
) {
  return api.post<Appointment>("/appointment", data, { token, auth: true });
}

export async function getMyAppointments(token: string | null) {
  return api.get<Appointment[]>("/appointment/my", { token, auth: true });
}

export async function getDoctorAppointments(token: string | null) {
  return api.get<Appointment[]>("/appointment/doctor/my", {
    token,
    auth: true,
  });
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string,
  token: string | null,
) {
  const payload: ReschedulePayload = { date, time };
  return api.patch<Appointment>(`/appointment/rescheduled/${id}`, payload, {
    token,
    auth: true,
  });
}

export async function cancelAppointment(id: string, token: string | null) {
  return api.patch<Appointment>(`/appointment/cancel/${id}`, undefined, {
    token,
    auth: true,
  });
}

export async function getAllAppointments(token: string | null) {
  return api.get<Appointment[]>("/appointment", { token, auth: true });
}

export async function updateAppointment(
  id: string,
  data: UpdateAppointmentPayload | Record<string, unknown>,
  token: string | null,
) {
  return api.patch<Appointment>(`/appointment/${id}`, data, {
    token,
    auth: true,
  });
}
