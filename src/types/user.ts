import type { AuthUser } from "./auth";

export type DoctorProfile = {
  id: string;
  specialty: string;
  bio?: string;
  defaultMeetLink?: string;
  availability?: unknown;
};

export type UserProfile = AuthUser & {
  doctorProfile?: DoctorProfile;
};

export type EmailExistsResponse = {
  exists: boolean;
};
