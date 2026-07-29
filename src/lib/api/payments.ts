import { api } from "./client";
import type { ChatAccessResponse, Payment, UnlockChatResponse } from "@/types";

export type ListPaymentsParams = {
  search?: string;
  status?: string;
};

export async function listPayments(
  token: string | null,
  params: ListPaymentsParams | string = {},
) {
  // Back-compat: listPayments(token, "failed")
  const query =
    typeof params === "string"
      ? { status: params }
      : {
          search: params.search?.trim() || undefined,
          status:
            params.status && params.status !== "all"
              ? params.status
              : undefined,
        };

  return api.get<Payment[]>("/payments", {
    token,
    auth: true,
    query,
  });
}

export async function updatePayment(
  id: string,
  data: { chatEntitled?: boolean },
  token: string | null,
) {
  return api.patch<Payment>(`/payments/${id}`, data, { token, auth: true });
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
