import type { ApiRole } from "./common";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: ApiRole | string;
  phone?: string | null;
  avatarUrl?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  fullName: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type GoogleAuthPayload = {
  idToken: string;
};
