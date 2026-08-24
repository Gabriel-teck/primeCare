import { api } from "./client";
import type {
  Consultation,
  ConsultationDoctor,
  ConsultationPayload,
  ReschedulePayload,
  UpdateConsultationPayload,
} from "@/types";

export type { ConsultationPayload } from "@/types";

export async function listConsultationDoctors(token: string | null) {
  return api.get<ConsultationDoctor[]>("/consultations/doctors", {
    token,
    auth: true,
  });
}

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

export async function getMyConsultations(
  token: string | null,
  status?: string,
) {
  return api.get<Consultation[]>("/consultations/my", {
    token,
    auth: true,
    query: {
      status: status && status !== "all" ? status : undefined,
    },
  });
}

export async function getDoctorConsultations(
  token: string | null,
  status?: string,
) {
  return api.get<Consultation[]>("/consultations/doctor/my", {
    token,
    auth: true,
    query: {
      status: status && status !== "all" ? status : undefined,
    },
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

export async function getAllConsultations(
  token: string | null,
  status?: string,
) {
  return api.get<Consultation[]>("/consultations", {
    token,
    auth: true,
    query: {
      status: status && status !== "all" ? status : undefined,
    },
  });
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
