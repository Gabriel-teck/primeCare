import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "./config";
import { ApiError } from "./errors";

type RetryConfig = InternalAxiosRequestConfig & {
  _retry401?: boolean;
};

function readStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function clearSessionAndRedirect() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  const path = window.location.pathname;
  if (!path.startsWith("/login") && !path.startsWith("/register")) {
    window.location.assign("/login");
  }
}

function messageFromBody(body: unknown, fallback: string) {
  if (typeof body === "string" && body.trim()) return body;
  if (body && typeof body === "object") {
    const maybe = body as { message?: string | string[] };
    if (Array.isArray(maybe.message)) return maybe.message.join(", ");
    if (typeof maybe.message === "string") return maybe.message;
  }
  return fallback;
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

http.interceptors.request.use((config) => {
  const existing = config.headers.Authorization;
  if (!existing) {
    const token = readStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Let the browser set multipart boundary for FormData
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const body = error.response.data;
      const message = messageFromBody(body, `Request failed (${status})`);

      if (status === 401) {
        const config = error.config as RetryConfig | undefined;
        const url = config?.url ?? "";
        const isAuthRoute =
          url.includes("/auth/login") ||
          url.includes("/auth/register") ||
          url.includes("/users/register") ||
          url.includes("/auth/google");

        if (!isAuthRoute && !config?._retry401) {
          if (config) config._retry401 = true;
          clearSessionAndRedirect();
        }
      }

      return Promise.reject(new ApiError(status, message, body));
    }

    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new ApiError(408, "Request timed out. Please try again."),
      );
    }

    return Promise.reject(
      new ApiError(0, error.message || "Network error. Check your connection."),
    );
  },
);
