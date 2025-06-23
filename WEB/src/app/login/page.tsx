"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ApiError } from "@/types/api-error";
import { useAuth } from "@/contexts/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="h-screen w-screen flex justify-center items-center bg-background text-foreground">
      <div className="w-full max-w-md px-6 py-10 rounded-2xl shadow-lg border bg-card flex flex-col gap-8 items-center justify-center">
        <Logo />
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
              className="w-full p-3 rounded-lg bg-input text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Digite seu email"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-input text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Digite sua senha"
            />
          </div>
          {error && <p className="text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-violet-700 text-white py-3 rounded-lg font-semibold hover:bg-violet-500 transition-colors flex items-center justify-center"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
