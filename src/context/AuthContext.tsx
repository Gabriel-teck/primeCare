"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "@/lib/api/auth";
import * as userApi from "@/lib/api/user";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  enterPreviewAdmin: () => void;
  enterPreviewDoctor: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const PREVIEW_TOKEN = "preview-admin-token";
export const DOCTOR_PREVIEW_TOKEN = "preview-doctor-token";

export const PREVIEW_ADMIN: AuthUser = {
  id: "preview-admin",
  email: "admin@primecare.health",
  fullName: "PrimeCare Admin",
  role: "super_admin",
};

export const PREVIEW_DOCTOR: AuthUser = {
  id: "doc-1",
  email: "ada.okonkwo@primecare.health",
  fullName: "Dr. Ada Okonkwo",
  role: "doctor",
};

const ADMIN_PREVIEW = process.env.NEXT_PUBLIC_ADMIN_PREVIEW === "true";
const DOCTOR_PREVIEW = process.env.NEXT_PUBLIC_DOCTOR_PREVIEW === "true";

export function isAdminRole(role?: string) {
  return role === "admin" || role === "super_admin";
}

function dashboardForRole(role: string) {
  if (isAdminRole(role)) return "/admin-dashboard";
  if (role === "doctor") return "/doctor-dashboard";
  return "/patient-dashboard";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (ADMIN_PREVIEW) return PREVIEW_ADMIN;
    if (DOCTOR_PREVIEW) return PREVIEW_DOCTOR;
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    if (ADMIN_PREVIEW) return PREVIEW_TOKEN;
    if (DOCTOR_PREVIEW) return DOCTOR_PREVIEW_TOKEN;
    return null;
  });
  const [ready, setReady] = useState(ADMIN_PREVIEW || DOCTOR_PREVIEW);

  const enterPreviewAdmin = () => {
    if (!ADMIN_PREVIEW) return;
    setToken(PREVIEW_TOKEN);
    setUser(PREVIEW_ADMIN);
  };

  const enterPreviewDoctor = () => {
    if (!DOCTOR_PREVIEW) return;
    setToken(DOCTOR_PREVIEW_TOKEN);
    setUser(PREVIEW_DOCTOR);
  };

  useEffect(() => {
    const stored = localStorage.getItem("token");

    if (
      !stored ||
      stored === PREVIEW_TOKEN ||
      stored === DOCTOR_PREVIEW_TOKEN
    ) {
      if (stored === DOCTOR_PREVIEW_TOKEN && DOCTOR_PREVIEW) {
        setToken(DOCTOR_PREVIEW_TOKEN);
        setUser(PREVIEW_DOCTOR);
      } else if (ADMIN_PREVIEW) {
        setToken(PREVIEW_TOKEN);
        setUser(PREVIEW_ADMIN);
      } else if (DOCTOR_PREVIEW) {
        setToken(DOCTOR_PREVIEW_TOKEN);
        setUser(PREVIEW_DOCTOR);
      }
      setReady(true);
      return;
    }

    userApi
      .getUser(stored)
      .then((nextUser) => {
        if (ADMIN_PREVIEW && !isAdminRole(nextUser.role)) {
          setToken(PREVIEW_TOKEN);
          setUser(PREVIEW_ADMIN);
          return;
        }
        setToken(stored);
        setUser(nextUser);
      })
      .catch(() => {
        if (ADMIN_PREVIEW) {
          setToken(PREVIEW_TOKEN);
          setUser(PREVIEW_ADMIN);
        } else if (DOCTOR_PREVIEW) {
          setToken(DOCTOR_PREVIEW_TOKEN);
          setUser(PREVIEW_DOCTOR);
        } else {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setToken(data.access_token);
    localStorage.setItem("token", data.access_token);
    const nextUser = await userApi.getUser(data.access_token);
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    if (ADMIN_PREVIEW) {
      setToken(PREVIEW_TOKEN);
      setUser(PREVIEW_ADMIN);
      return;
    }
    if (DOCTOR_PREVIEW) {
      setToken(DOCTOR_PREVIEW_TOKEN);
      setUser(PREVIEW_DOCTOR);
      return;
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        login,
        logout,
        enterPreviewAdmin,
        enterPreviewDoctor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { dashboardForRole };
