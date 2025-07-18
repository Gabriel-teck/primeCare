const API_BASE_URL = "http://localhost:3001";

export async function getMessages(conversationId: string, token: string) {
  const res = await fetch(
    `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export async function sendMessage(
  conversationId: string,
  content: string,
  token: string
) {
  const res = await fetch(`${API_BASE_URL}/chat/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, content }),
  });
  if (!res.ok) throw new Error("Send failed");
  return res.json();
}
