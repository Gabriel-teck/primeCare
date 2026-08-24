export type PatientDirectoryStatus = "active" | "new" | "inactive";

export type PatientDirectoryItem = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  visits: number;
  lastVisit: string | null;
  status: PatientDirectoryStatus;
};
