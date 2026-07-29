export type ChatPeer = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export type ChatMessage = {
  id: string;
  content: string;
  sender: "patient" | "doctor" | "admin" | string;
  senderId?: string;
  createdAt: string;
  readAt?: string | null;
  conversationId?: string;
};

/** Legacy UI message shape used by some chat components. */
export interface Message {
  id: string;
  text: string;
  sender: "user" | "doctor";
  timestamp: Date;
  type: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
}

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export type Conversation = {
  id: string;
  type: string;
  patientId?: string;
  adminId?: string;
  doctorId?: string;
  peer?: ChatPeer | null;
  messages?: ChatMessage[];
  updatedAt?: string;
};

export type CreateConversationPayload = {
  adminId?: string;
  doctorId?: string;
  patientId?: string;
  type?: string;
};

export type SendMessagePayload = {
  conversationId: string;
  content: string;
};

export type UnreadCountResponse = {
  count: number;
};
