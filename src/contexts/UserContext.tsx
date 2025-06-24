"use client";

import React, { createContext, useContext, useState } from "react";
import { api } from "@/lib/axios";
import { usePathname, useRouter } from "next/navigation";
import { AuthContextType } from "@/interfaces/AuthContextType";
import { User } from "@/interfaces/User";
import { showToastPromise } from "@/components/ToastMessage";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticatedBoolean, setIsAuthenticatedBoolean] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

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
      if (pathname !== "/login") {
      router.push("/login");
    }
      setIsAuthenticatedBoolean(false);
    } else {
      setIsAuthenticatedBoolean(true);
      getUsuario().catch((error) => {
        if (error.response && error.response.status === 404) {
          if (pathname !== "/login") {
          router.push("/login");
        }
          setIsAuthenticatedBoolean(false);
        } else {
          setIsAuthenticatedBoolean(true);
        }
      });
    }
  };

  const login = async (email: string, password: string) => {
    const loginPromise = api.post("/login", { email, password });

    await showToastPromise(loginPromise, {
      loading: "Entrando...",
      success: "Login realizado com sucesso!",
      error: "Erro ao fazer login. Verifique suas credenciais.",
    });

    const response = await loginPromise;
    const { token } = response.data;
    localStorage.setItem("token", token);
    setToken(token);

    if (token) {
      router.push("/");
    }
  };

  const getUsuario = async (): Promise<User | undefined> => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
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

  const logout = async () => {
    const logoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        const sysActivityUser = crypto.randomUUID();
        localStorage.setItem("sys-activity-user", sysActivityUser);
        localStorage.removeItem("token");
        setToken(null);
        resolve();
      }, 1000);
    });

    await showToastPromise(logoutPromise, {
      loading: "Saindo...",
      success: "Logout realizado com sucesso!",
      error: "Erro ao fazer logout.",
    });

    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        register,
        login,
        logout,
        getUsuario,
        isAuthenticated,
        isAuthenticatedBoolean,
      }}
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
