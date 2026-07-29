import { api } from "./client";
import type {
  CreateDoctorPayload,
  StaffMember,
  UpdateDoctorPayload,
} from "@/types";

export async function listStaff(token: string | null, role?: string) {
  return api.get<StaffMember[]>("/staff", {
    token,
    auth: true,
    query: { role },
  });
}

export async function getStaffMember(id: string, token: string | null) {
  return api.get<StaffMember>(`/staff/${id}`, { token, auth: true });
}

export async function createDoctor(
  data: CreateDoctorPayload,
  token: string | null,
) {
  return api.post<StaffMember>("/staff/doctors", data, { token, auth: true });
}

export async function updateDoctor(
  id: string,
  data: UpdateDoctorPayload,
  token: string | null,
) {
  return api.patch<StaffMember>(`/staff/doctors/${id}`, data, {
    token,
    auth: true,
  });
}
