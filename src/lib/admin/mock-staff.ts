import type { StaffMember } from "./types";

export const mockStaff: StaffMember[] = [
  {
    id: "doc-1",
    fullName: "Dr. Ada Okonkwo",
    email: "ada.okonkwo@primecare.health",
    role: "doctor",
    specialty: "General Practice",
    active: true,
    phone: "+234 801 111 2233",
    bio: "Primary care and telehealth consultations.",
  },
  {
    id: "doc-2",
    fullName: "Dr. Chinedu Bello",
    email: "chinedu.bello@primecare.health",
    role: "doctor",
    specialty: "Dermatology",
    active: true,
    phone: "+234 802 444 5566",
    bio: "Skin, hair, and nail specialist.",
  },
  {
    id: "doc-3",
    fullName: "Dr. Fatima Yusuf",
    email: "fatima.yusuf@primecare.health",
    role: "doctor",
    specialty: "Psychiatry",
    active: true,
    phone: "+234 803 777 8899",
  },
  {
    id: "doc-4",
    fullName: "Dr. Michael Adeyemi",
    email: "michael.adeyemi@primecare.health",
    role: "doctor",
    specialty: "Dentistry",
    active: false,
  },
  {
    id: "sup-1",
    fullName: "Ngozi Eze",
    email: "ngozi.eze@primecare.health",
    role: "support",
    specialty: "Patient Support",
    active: true,
  },
];

export function getActiveDoctors() {
  return mockStaff.filter((s) => s.role === "doctor" && s.active);
}

export function getStaffById(id: string) {
  return mockStaff.find((s) => s.id === id);
}
