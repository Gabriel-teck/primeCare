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
};

const AuthContext = createContext<AuthContextType | null>(null);

export const PREVIEW_TOKEN = "preview-admin-token";
export const PREVIEW_ADMIN: AuthUser = {
  id: "preview-admin",
  email: "admin@primecare.health",
  fullName: "PrimeCare Admin",
  role: "super_admin",
};

const PREVIEW_ENABLED = process.env.NEXT_PUBLIC_ADMIN_PREVIEW === "true";

function isAdminRole(role?: string) {
  return role === "admin" || role === "super_admin";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(
    PREVIEW_ENABLED ? PREVIEW_ADMIN : null,
  );
  const [token, setToken] = useState<string | null>(
    PREVIEW_ENABLED ? PREVIEW_TOKEN : null,
  );
  const [ready, setReady] = useState(PREVIEW_ENABLED);

  useEffect(() => {
    const stored = localStorage.getItem("token");

    if (!stored || stored === PREVIEW_TOKEN) {
      if (PREVIEW_ENABLED) {
        setToken(PREVIEW_TOKEN);
        setUser(PREVIEW_ADMIN);
      }
      setReady(true);
      return;
    }

    userApi
      .getUser(stored)
      .then((nextUser) => {
        if (PREVIEW_ENABLED && !isAdminRole(nextUser.role)) {
          // Keep preview admin so the dashboard stays accessible for UI review.
          setToken(PREVIEW_TOKEN);
          setUser(PREVIEW_ADMIN);
          return;
        }
        setToken(stored);
        setUser(nextUser);
      })
      .catch(() => {
        if (PREVIEW_ENABLED) {
          setToken(PREVIEW_TOKEN);
          setUser(PREVIEW_ADMIN);
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
    if (PREVIEW_ENABLED) {
      setToken(PREVIEW_TOKEN);
      setUser(PREVIEW_ADMIN);
      return;
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout }}>
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
