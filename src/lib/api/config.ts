function normalizeApiUrl(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  let value = raw.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(value)) {
    value = `http://${value}`;
  }
  return value;
}

const fromEnv =
  normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL) ??
  normalizeApiUrl(process.env.NEXT_PUBLIC_API);

/** Backend API origin. Set NEXT_PUBLIC_API_URL in .env (e.g. https://api.example.com). */
export const API_BASE_URL = fromEnv ?? "http://localhost:3001";

export const SOCKET_URL = API_BASE_URL;

/** Default request timeout in milliseconds */
export const API_TIMEOUT_MS = 15_000;
