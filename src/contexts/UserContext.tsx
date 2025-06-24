"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { AuthContextType } from "@/interfaces/AuthContextType";
import { User } from "@/interfaces/User";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    if (!token) {
      router.push("/login");
    } else {
      router.push("/");
    }
  }, [token, router]);

  const login = async (email: string, password: string) => {
    const response = await api.post("/login", { email, password });
    const { token } = response.data;
    localStorage.setItem("token", token);
    setToken(token);
    router.push("/");
  };

  const getUsuario = async (): Promise<User> => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    const sysActivityUser = crypto.randomUUID();
    localStorage.setItem("sys-activity-user", sysActivityUser);
    localStorage.removeItem("token");
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ token, login, logout, getUsuario, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
