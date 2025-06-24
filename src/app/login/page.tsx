"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ApiError } from "@/types/api-error";
import { useAuth } from "@/contexts/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      login(email, password);
      router.push("/");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message;
      if (message) {
        setError(message);
      } else {
        setError("Erro ao conectar com o servidor");
      }
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-violet-900 text-foreground">
      <div className="w-full max-w-md px-8 py-12 rounded-3xl shadow-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col gap-8 items-center justify-center backdrop-blur-md">
        <Logo />
        <h2 className="text-2xl font-bold text-center">
          Bem-vindo {localStorage.getItem("sys-activity-user") ? <span>de volta!</span> : null}
        </h2>
        <form
          onSubmit={handleLogin}
          className="space-y-6 flex flex-col justify-center w-full"
        >
          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-zinc-800 text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all"
              placeholder="Digite seu email"
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <label className="block mb-1 font-semibold">Senha</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-zinc-800 text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all pr-12"
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-9 text-zinc-400 hover:text-violet-400 transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M3 3l18 18M10.7 10.7a3 3 0 104.6 4.6M9.53 9.53A3 3 0 0112 9c3.31 0 6 2.69 6 6 0 .34-.03.67-.08.99M6.1 6.1A9.77 9.77 0 003 12c1.73 3.11 5.06 6 9 6 1.61 0 3.13-.37 4.47-1.02"
                  />
                </svg>
              ) : (
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-center animate-pulse">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-700 to-violet-500 text-white py-3 rounded-lg font-semibold shadow-md hover:from-violet-600 hover:to-violet-400 transition-all flex items-center justify-center"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
