import { api } from "./client";
import type {
  AuthUser,
  EmailExistsResponse,
  PatientDirectoryItem,
  UserProfile,
} from "@/types";

export async function getUser(token: string) {
  return api.get<UserProfile>("/users/me", { token, auth: true });
}

export type UpdateProfilePayload = {
  fullName?: string;
  phone?: string;
};

export async function updateProfile(
  payload: UpdateProfilePayload,
  token?: string | null,
) {
  return api.patch<UserProfile>("/users/me", payload, { token, auth: true });
}

export async function checkEmailExists(email: string) {
  const data = await api.get<EmailExistsResponse>("/users/exists", {
    query: { email },
  });
  return data.exists;
}

export type ListPatientsParams = {
  search?: string;
  status?: string;
};

export async function getAllPatients(
  token: string,
  params: ListPatientsParams = {},
) {
  const { search, status } = params;
  return api.get<PatientDirectoryItem[]>("/users/patients", {
    token,
    auth: true,
    query: {
      search: search?.trim() || undefined,
      status: status && status !== "all" ? status : undefined,
    },
  });
}

export async function getPatientById(id: string, token: string) {
  return api.get<AuthUser>(`/users/patients/${id}`, { token, auth: true });
}
