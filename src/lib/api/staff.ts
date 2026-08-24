import { api } from "./client";
import type {
  CreateDoctorPayload,
  StaffMember,
  UpdateDoctorPayload,
} from "@/types";

export type ListStaffParams = {
  search?: string;
  role?: string;
  status?: string;
};

export async function listStaff(
  token: string | null,
  params: ListStaffParams | string = {},
) {
  // Back-compat: listStaff(token, "doctor")
  const query =
    typeof params === "string"
      ? { role: params }
      : {
          search: params.search?.trim() || undefined,
          role: params.role && params.role !== "all" ? params.role : undefined,
          status:
            params.status && params.status !== "all"
              ? params.status
              : undefined,
        };

  return api.get<StaffMember[]>("/staff", {
    token,
    auth: true,
    query,
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
