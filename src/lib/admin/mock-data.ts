import type {
  PaymentRecord,
  CatalogItem,
  ContentBlock,
  DoctorThread,
} from "./types";

export const mockPayments: PaymentRecord[] = [
  {
    id: "pay-1",
    patientName: "Eze Macaulay",
    patientEmail: "eze@example.com",
    amount: 2500,
    currency: "NGN",
    method: "Card",
    status: "paid",
    description: "Chat access unlock",
    createdAt: "2026-07-20T10:00:00Z",
    chatEntitled: true,
  },
  {
    id: "pay-2",
    patientName: "Amanda Eze",
    patientEmail: "amanda@example.com",
    amount: 3000,
    currency: "NGN",
    method: "Bank transfer",
    status: "pending",
    description: "Urgent care — Malaria",
    createdAt: "2026-07-22T14:30:00Z",
  },
  {
    id: "pay-3",
    patientName: "Joseph Utulu",
    patientEmail: "joseph@example.com",
    amount: 5000,
    currency: "NGN",
    method: "Card",
    status: "failed",
    description: "Specialist consultation",
    createdAt: "2026-07-24T09:15:00Z",
  },
  {
    id: "pay-4",
    patientName: "Gabriel Udoh",
    patientEmail: "gabriel@example.com",
    amount: 2500,
    currency: "NGN",
    method: "Card",
    status: "refunded",
    description: "Chat access unlock",
    createdAt: "2026-07-18T16:45:00Z",
    chatEntitled: false,
  },
];

export const mockCatalog: CatalogItem[] = [
  {
    id: "cat-1",
    name: "Dermatologist",
    type: "specialty",
    description: "Skin, hair and nails treatment.",
    published: true,
    price: 8000,
    currency: "NGN",
  },
  {
    id: "cat-2",
    name: "Psychiatry",
    type: "specialty",
    description: "Mental health consultations.",
    published: true,
    price: 10000,
    currency: "NGN",
  },
  {
    id: "cat-3",
    name: "Malaria",
    type: "urgent_care",
    description: "Same-day urgent care consultation.",
    published: true,
    price: 3000,
    currency: "NGN",
  },
  {
    id: "cat-4",
    name: "Online Video Call",
    type: "service",
    description: "Standard telehealth video consultation.",
    published: true,
    price: 5000,
    currency: "NGN",
  },
];

export const mockContent: ContentBlock[] = [
  {
    id: "cnt-1",
    key: "hero_headline",
    title: "Hero headline",
    body: "Online Doctors A Few Clicks Away!",
  },
  {
    id: "cnt-2",
    key: "how_it_works_1",
    title: "Browse Doctors / Medical conditions",
    body: "Find the right care path and specialist for your needs.",
  },
  {
    id: "cnt-3",
    key: "testimonial_intro",
    title: "Testimonials intro",
    body: "Our customers love using PrimeCare",
  },
];

export const mockDoctorThreads: DoctorThread[] = [
  {
    doctorId: "doc-1",
    messages: [
      {
        id: "m1",
        senderId: "admin",
        senderRole: "super_admin",
        content: "Hi Ada — can you cover urgent care slots this weekend?",
        createdAt: "2026-07-27T09:00:00Z",
        read: true,
      },
      {
        id: "m2",
        senderId: "doc-1",
        senderRole: "doctor",
        content: "Yes, I can take Saturday morning.",
        createdAt: "2026-07-27T09:12:00Z",
        read: false,
      },
    ],
  },
  {
    doctorId: "doc-2",
    messages: [
      {
        id: "m3",
        senderId: "doc-2",
        senderRole: "doctor",
        content: "Please review the new dermatology pricing.",
        createdAt: "2026-07-26T15:20:00Z",
        read: false,
      },
    ],
  },
];
