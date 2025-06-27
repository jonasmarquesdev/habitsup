"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthContextType } from "@/interfaces/AuthContextType";
import { User } from "@/interfaces/User";
import { showToastPromise } from "@/components/ToastMessage";
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  logoutUser 
} from "@/lib/actions/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticatedBoolean, setIsAuthenticatedBoolean] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success) {
          setUser(result.user as User);
          setIsAuthenticatedBoolean(true);
        } else {
          setUser(null);
          setIsAuthenticatedBoolean(false);
          if (pathname !== "/login" && pathname !== "/register") {
            router.push("/login");
          }
        }
      } catch {
        setUser(null);
        setIsAuthenticatedBoolean(false);
        if (pathname !== "/login" && pathname !== "/register") {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname, router]);

  const register = async (name: string, email: string, password: string) => {
    const registerPromise = registerUser(name, email, password).then((result) => {
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    });

    await showToastPromise(registerPromise, {
      loading: "Criando conta...",
      success: "Conta criada com sucesso!",
      error: "Erro ao criar conta.",
    });

    const result = await registerPromise;
    
    if (result.success) {
      setUser(result.user as User);
      setIsAuthenticatedBoolean(true);
      router.push("/");
    }
  };

  const isAuthenticated = () => {
    return isAuthenticatedBoolean;
  };

  const login = async (email: string, password: string) => {
    const loginPromise = loginUser(email, password).then((result) => {
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    });

    await showToastPromise(loginPromise, {
      loading: "Entrando...",
      success: "Login realizado com sucesso!",
      error: "Erro ao fazer login. Verifique suas credenciais.",
    });

    const result = await loginPromise;

    if (result.success) {
      setUser(result.user as User);
      setIsAuthenticatedBoolean(true);
      
      setTimeout(() => {
        router.push("/");
      }, 100);
    }
  };

  const getUsuario = async (): Promise<User | undefined> => {
    if (user) return user;
    
    const result = await getCurrentUser();
    if (result.success) {
      setUser(result.user as User);
      return result.user as User;
    }
    return undefined;
  };

  const logout = async () => {
    const logoutPromise = logoutUser();

    await showToastPromise(logoutPromise, {
      loading: "Saindo...",
      success: "Logout realizado com sucesso!",
      error: "Erro ao fazer logout.",
    });

    setUser(null);
    setIsAuthenticatedBoolean(false);
    
    // Only access localStorage on the client side
    if (typeof window !== "undefined") {
      const sysActivityUser = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36);
      localStorage.setItem("sys-activity-user", sysActivityUser);
    }
    
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
