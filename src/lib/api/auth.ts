import { api } from "./client";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  GoogleAuthPayload,
  LoginPayload,
  MessageResponse,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types";

export async function login(email: string, password: string) {
  const payload: LoginPayload = { email, password };
  return api.post<AuthResponse>("/auth/login", payload);
}

export async function registerUser(
  email: string,
  fullName: string,
  password: string,
) {
  const payload: RegisterPayload = { email, fullName, password };
  return api.post<AuthResponse>("/users/register", payload);
}

export async function forgotPassword(email: string) {
  const payload: ForgotPasswordPayload = { email };
  return api.post<MessageResponse>("/auth/forgot-password", payload);
}

export async function resetPassword(token: string, password: string) {
  const payload: ResetPasswordPayload = { token, password };
  return api.post<MessageResponse>("/auth/reset-password", payload);
}

export async function googleAuth(idToken: string) {
  const payload: GoogleAuthPayload = { idToken };
  return api.post<AuthResponse>("/auth/google", payload);
}
