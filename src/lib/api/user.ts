import { api } from "./client";
import type { AuthUser, EmailExistsResponse, UserProfile } from "@/types";

export async function getUser(token: string) {
  return api.get<UserProfile>("/users/me", { token, auth: true });
}

export async function checkEmailExists(email: string) {
  const data = await api.get<EmailExistsResponse>("/users/exists", {
    query: { email },
  });
  return data.exists;
}

export async function getAllPatients(token: string) {
  return api.get<AuthUser[]>("/users/patients", { token, auth: true });
}

export async function getPatientById(id: string, token: string) {
  return api.get<AuthUser>(`/users/patients/${id}`, { token, auth: true });
}
