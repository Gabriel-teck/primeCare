import type { AdminBooking } from "@/lib/admin/types";

export type DoctorPatient = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  lastVisit?: string;
  notes?: string;
};

export type PatientMessage = {
  id: string;
  senderId: string;
  senderRole: "doctor" | "patient";
  content: string;
  createdAt: string;
  read: boolean;
};

export type PatientThread = {
  patientId: string;
  patientName: string;
  patientEmail: string;
  messages: PatientMessage[];
};

export type AdminDmMessage = {
  id: string;
  senderId: string;
  senderRole: "super_admin" | "doctor";
  content: string;
  createdAt: string;
  read: boolean;
};

/** Mock schedule for preview doctor (doc-1 / Dr. Ada Okonkwo). */
export const mockDoctorBookings: AdminBooking[] = [
  {
    id: "db-1",
    fullName: "Eze Macaulay",
    email: "eze@example.com",
    phoneNumber: "+234 810 111 2222",
    date: "2026-07-28",
    time: "09:00",
    status: "confirmed",
    reason: "Follow-up on blood pressure medication",
    kind: "appointment",
    typeLabel: "follow-up",
  },
  {
    id: "db-2",
    fullName: "Amanda Eze",
    email: "amanda@example.com",
    phoneNumber: "+234 811 333 4444",
    date: "2026-07-28",
    time: "11:30",
    status: "pending",
    reason: "Skin rash for 3 days",
    kind: "consultation",
    typeLabel: "Online Video Call",
    fileName: "rash-photo.jpg",
  },
  {
    id: "db-3",
    fullName: "Joseph Utulu",
    email: "joseph@example.com",
    phoneNumber: "+234 812 555 6666",
    date: "2026-07-28",
    time: "14:00",
    status: "pending",
    reason: "Annual wellness check",
    kind: "appointment",
    typeLabel: "routine",
  },
  {
    id: "db-4",
    fullName: "Chioma Nwosu",
    email: "chioma@example.com",
    phoneNumber: "+234 813 777 8888",
    date: "2026-07-29",
    time: "10:00",
    status: "confirmed",
    reason: "Telehealth consult — fever and cough",
    kind: "consultation",
    typeLabel: "Online Video Call",
    googleMeetLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "db-5",
    fullName: "Eze Macaulay",
    email: "eze@example.com",
    phoneNumber: "+234 810 111 2222",
    date: "2026-07-20",
    time: "15:00",
    status: "completed",
    reason: "Initial hypertension consult",
    kind: "appointment",
    typeLabel: "consultation",
  },
  {
    id: "db-6",
    fullName: "Tunde Bakare",
    email: "tunde@example.com",
    phoneNumber: "+234 814 999 0000",
    date: "2026-07-30",
    time: "16:30",
    status: "rescheduled",
    reason: "Lab results review",
    kind: "consultation",
    typeLabel: "Online Video Call",
    fileName: "lab-results.pdf",
  },
];

export const mockDoctorPatients: DoctorPatient[] = [
  {
    id: "pat-1",
    fullName: "Eze Macaulay",
    email: "eze@example.com",
    phone: "+234 810 111 2222",
    lastVisit: "2026-07-28",
    notes: "Hypertension — monitor BP weekly.",
  },
  {
    id: "pat-2",
    fullName: "Amanda Eze",
    email: "amanda@example.com",
    phone: "+234 811 333 4444",
    lastVisit: "2026-07-28",
  },
  {
    id: "pat-3",
    fullName: "Joseph Utulu",
    email: "joseph@example.com",
    phone: "+234 812 555 6666",
    lastVisit: "2026-07-28",
  },
  {
    id: "pat-4",
    fullName: "Chioma Nwosu",
    email: "chioma@example.com",
    phone: "+234 813 777 8888",
    lastVisit: "2026-07-29",
  },
  {
    id: "pat-5",
    fullName: "Tunde Bakare",
    email: "tunde@example.com",
    phone: "+234 814 999 0000",
    lastVisit: "2026-07-30",
    notes: "Awaiting lab panel.",
  },
];

export const mockPatientThreads: PatientThread[] = [
  {
    patientId: "pat-1",
    patientName: "Eze Macaulay",
    patientEmail: "eze@example.com",
    messages: [
      {
        id: "pm1",
        senderId: "pat-1",
        senderRole: "patient",
        content: "Doctor, my morning BP was 142/90 today.",
        createdAt: "2026-07-28T07:15:00Z",
        read: false,
      },
      {
        id: "pm2",
        senderId: "doc-1",
        senderRole: "doctor",
        content: "Thanks for sharing. Keep logging for a few more days.",
        createdAt: "2026-07-27T18:00:00Z",
        read: true,
      },
    ],
  },
  {
    patientId: "pat-2",
    patientName: "Amanda Eze",
    patientEmail: "amanda@example.com",
    messages: [
      {
        id: "pm3",
        senderId: "pat-2",
        senderRole: "patient",
        content: "I uploaded a photo of the rash before our call.",
        createdAt: "2026-07-28T08:40:00Z",
        read: false,
      },
    ],
  },
  {
    patientId: "pat-4",
    patientName: "Chioma Nwosu",
    patientEmail: "chioma@example.com",
    messages: [
      {
        id: "pm4",
        senderId: "doc-1",
        senderRole: "doctor",
        content: "Please join a few minutes early for the video consult.",
        createdAt: "2026-07-27T12:00:00Z",
        read: true,
      },
      {
        id: "pm5",
        senderId: "pat-4",
        senderRole: "patient",
        content: "Will do, thank you doctor.",
        createdAt: "2026-07-27T12:05:00Z",
        read: true,
      },
    ],
  },
];

/** Admin DM thread as seen by the preview doctor (doc-1). */
export const mockAdminDmMessages: AdminDmMessage[] = [
  {
    id: "am1",
    senderId: "admin",
    senderRole: "super_admin",
    content: "Hi Ada — can you cover urgent care slots this weekend?",
    createdAt: "2026-07-27T09:00:00Z",
    read: true,
  },
  {
    id: "am2",
    senderId: "doc-1",
    senderRole: "doctor",
    content: "Yes, I can take Saturday morning.",
    createdAt: "2026-07-27T09:12:00Z",
    read: true,
  },
  {
    id: "am3",
    senderId: "admin",
    senderRole: "super_admin",
    content: "Perfect. Also please confirm pending consults for today.",
    createdAt: "2026-07-28T08:00:00Z",
    read: false,
  },
];

export function getBookingById(id: string) {
  return mockDoctorBookings.find((b) => b.id === id);
}

export function getPatientById(id: string) {
  return mockDoctorPatients.find((p) => p.id === id);
}

export function getPatientByEmail(email: string) {
  return mockDoctorPatients.find(
    (p) => p.email.toLowerCase() === email.toLowerCase(),
  );
}

export function bookingsForPatient(email: string) {
  return mockDoctorBookings.filter(
    (b) => b.email.toLowerCase() === email.toLowerCase(),
  );
}
