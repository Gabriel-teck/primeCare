import { api } from "./client";
import type {
  ChatMessage,
  Conversation,
  CreateConversationPayload,
  SendMessagePayload,
  UnreadCountResponse,
} from "@/types";

export async function listConversations(token: string | null) {
  return api.get<Conversation[]>("/chat/conversations", { token, auth: true });
}

export async function getMessages(conversationId: string, token: string) {
  return api.get<ChatMessage[]>(
    `/chat/conversations/${conversationId}/messages`,
    { token, auth: true },
  );
}

export async function createConversation(
  payload: CreateConversationPayload,
  token: string | null,
) {
  return api.post<{ id: string; type: string }>(
    "/chat/conversations",
    payload,
    { token, auth: true },
  );
}

export async function sendMessage(
  conversationId: string,
  content: string,
  token: string,
) {
  const payload: SendMessagePayload = { conversationId, content };
  return api.post<ChatMessage>("/chat/send", payload, { token, auth: true });
}

export async function getUnreadCount(token: string | null) {
  return api.get<UnreadCountResponse>("/chat/unread", { token, auth: true });
}

export async function markConversationRead(
  conversationId: string,
  token: string | null,
) {
  return api.post<{ ok: boolean }>(
    `/chat/conversations/${conversationId}/read`,
    undefined,
    { token, auth: true },
  );
}
