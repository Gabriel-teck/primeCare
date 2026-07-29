export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | string;

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  description: string;
  chatEntitled: boolean;
  createdAt: string;
  patientName?: string;
  patientEmail?: string;
};

export type ChatAccessResponse = {
  entitled: boolean;
};

export type UnlockChatResponse = {
  id: string;
  chatEntitled: boolean;
  status: string;
  amount: number;
};
