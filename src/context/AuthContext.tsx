"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "@/lib/api/auth";
import * as userApi from "@/lib/api/user";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function isAdminRole(role?: string) {
  return role === "admin" || role === "super_admin";
}

function dashboardForRole(role: string) {
  if (isAdminRole(role)) return "/admin-dashboard";
  if (role === "doctor") return "/doctor-dashboard";
  return "/patient-dashboard";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("token");

    if (!stored) {
      setReady(true);
      return;
    }

    userApi
      .getUser(stored)
      .then((nextUser) => {
        setToken(stored);
        setUser(nextUser);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
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
        setUser,
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
