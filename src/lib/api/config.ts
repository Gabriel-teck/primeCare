export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001";

export const SOCKET_URL = API_BASE_URL;

/** Default request timeout in milliseconds */
export const API_TIMEOUT_MS = 15_000;
