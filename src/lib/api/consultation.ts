import { api } from "./client";
import type {
  Consultation,
  ConsultationPayload,
  ReschedulePayload,
  UpdateConsultationPayload,
} from "@/types";

export type { ConsultationPayload } from "@/types";

export async function bookConsultation(
  data: ConsultationPayload,
  token: string | null,
  file?: File,
) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "file" || value === undefined) return;
    formData.append(key, String(value));
  });
  if (file) formData.append("file", file);

  return api.postForm<Consultation>("/consultations", formData, {
    token,
    auth: true,
  });
}

export async function getMyConsultations(token: string | null) {
  return api.get<Consultation[]>("/consultations/my", { token, auth: true });
}

export async function getDoctorConsultations(token: string | null) {
  return api.get<Consultation[]>("/consultations/doctor/my", {
    token,
    auth: true,
  });
}

export async function cancelConsultation(id: string, token: string | null) {
  return api.patch<Consultation>(`/consultations/cancel/${id}`, undefined, {
    token,
    auth: true,
  });
}

export async function rescheduleConsultation(
  id: string,
  date: string,
  time: string,
  token: string | null,
) {
  const payload: ReschedulePayload = { date, time };
  return api.patch<Consultation>(`/consultations/reschedule/${id}`, payload, {
    token,
    auth: true,
  });
}

export async function getAllConsultations(token: string | null) {
  return api.get<Consultation[]>("/consultations", { token, auth: true });
}

export async function updateConsultation(
  id: string,
  data: UpdateConsultationPayload | Record<string, unknown>,
  token: string | null,
) {
  return api.patch<Consultation>(`/consultations/${id}`, data, {
    token,
    auth: true,
  });
}
