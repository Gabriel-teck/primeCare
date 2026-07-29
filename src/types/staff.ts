import type { AuthUser } from "./auth";
import type { DoctorProfile } from "./user";

export type StaffMember = AuthUser & {
  specialty?: string;
  bio?: string;
  active?: boolean;
  doctorProfile?: DoctorProfile;
};

export type CreateDoctorPayload = {
  email: string;
  password: string;
  fullName: string;
  specialty: string;
  phone?: string;
  bio?: string;
};

export type UpdateDoctorPayload = {
  fullName?: string;
  specialty?: string;
  phone?: string;
  bio?: string;
  isActive?: boolean;
  defaultMeetLink?: string;
};
