"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "@/lib/api/auth";
import * as userApi from "@/lib/api/user";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      userApi
        .getUser(stored)
        .then(setUser)
        .catch(() => setUser(null));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      console.log("AuthContext: Login response:", data);

      setToken(data.access_token);
      localStorage.setItem("token", data.access_token);

      // Fetch user data using the token
      const user = await userApi.getUser(data.access_token);
      console.log("AuthContext: User data from /users/me:", user);
      setUser(user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
