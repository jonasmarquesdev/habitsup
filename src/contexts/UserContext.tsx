"use client";

import React, { createContext, useContext, useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { AuthContextType } from "@/interfaces/AuthContextType";
import { User } from "@/interfaces/User";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticatedBoolean, setIsAuthenticatedBoolean] = useState(false);

  const router = useRouter();

  const register = async (name: string, email: string, password: string) => {
    await api.post("/user", { name, email, password });
    const responseToken = await api.post("/login", { email, password });
    const { token } = responseToken.data;
    localStorage.setItem("token", token);
    setToken(token);
    if (token) {
      router.push("/login");
    }
  };

  const isAuthenticated = () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
      setIsAuthenticatedBoolean(false);
    } else {
      setIsAuthenticatedBoolean(true);
      getUsuario().catch((error) => {
        if (error.response && error.response.status === 404) {
          router.push("/login");
          setIsAuthenticatedBoolean(false);
        } else {
          setIsAuthenticatedBoolean(true);
        }
      });
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/login", { email, password });
    const { token } = response.data;
    localStorage.setItem("token", token);
    setToken(token);
    if (token) {
      router.push("/");
    }
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
      value={{ token, register, login, logout, getUsuario, isAuthenticated, isAuthenticatedBoolean }}
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
