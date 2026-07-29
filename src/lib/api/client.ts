import type { AxiosRequestConfig } from "axios";
import { ApiError } from "./errors";
import { http } from "./http";

type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  formData?: FormData;
  token?: string | null;
  auth?: boolean;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  timeout?: number;
};

function resolveToken(explicit?: string | null) {
  if (explicit) return explicit;
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function cleanQuery(query?: Record<string, QueryValue>) {
  if (!query) return undefined;
  const params: Record<string, string> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params[key] = String(value);
  });
  return Object.keys(params).length ? params : undefined;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    formData,
    token,
    auth = false,
    query,
    headers = {},
    timeout,
  } = options;

  const resolvedToken = resolveToken(token);
  if (auth && !resolvedToken) {
    throw new ApiError(401, "Not authenticated");
  }

  const config: AxiosRequestConfig = {
    url: path,
    method,
    params: cleanQuery(query),
    headers: { ...headers },
    timeout,
  };

  if (resolvedToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${resolvedToken}`,
    };
  }

  if (formData) {
    config.data = formData;
  } else if (body !== undefined) {
    config.data = body;
    config.headers = {
      ...config.headers,
      "Content-Type": "application/json",
    };
  }

  const response = await http.request<T>(config);
  return response.data;
}

export const api = {
  get: <T>(
    path: string,
    options?: Omit<ApiRequestOptions, "method" | "body" | "formData">,
  ) => apiRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => apiRequest<T>(path, { ...options, method: "POST", body }),

  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => apiRequest<T>(path, { ...options, method: "PATCH", body }),

  put: <T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => apiRequest<T>(path, { ...options, method: "PUT", body }),

  delete: <T>(
    path: string,
    options?: Omit<ApiRequestOptions, "method" | "body" | "formData">,
  ) => apiRequest<T>(path, { ...options, method: "DELETE" }),

  postForm: <T>(
    path: string,
    formData: FormData,
    options?: Omit<ApiRequestOptions, "method" | "body" | "formData">,
  ) => apiRequest<T>(path, { ...options, method: "POST", formData }),
};
