import { api } from "./client";
import type { ChatAccessResponse, Payment, UnlockChatResponse } from "@/types";

export async function listPayments(token: string | null, status?: string) {
  return api.get<Payment[]>("/payments", {
    token,
    auth: true,
    query: { status },
  });
}

export async function getMyPayments(token: string | null) {
  return api.get<Payment[]>("/payments/my", { token, auth: true });
}

export async function unlockChat(token: string | null) {
  return api.post<UnlockChatResponse>("/payments/unlock-chat", undefined, {
    token,
    auth: true,
  });
}

export async function getChatAccess(token: string | null) {
  return api.get<ChatAccessResponse>("/payments/chat-access", {
    token,
    auth: true,
  });
}
