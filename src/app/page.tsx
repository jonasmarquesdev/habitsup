"use client";

import { Header } from "@/components/Header";
import { Nav } from "@/components/Nav";
import { SummaryTable } from "@/components/SummaryTable";
import Loading from "@/components/Loading";
import { useSummary } from "@/contexts/SummaryContext";
import { useAuth } from "@/contexts/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { isAuthenticated, isAuthenticatedBoolean, user, updateViewMode, loading } = useAuth();
  const { reloadSummary } = useSummary();
  const pathname = usePathname();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');

  // Sincronizar o viewMode com o usuário quando carregado
  useEffect(() => {
    if (user?.viewMode) {
      setViewMode(user.viewMode);
    }
  }, [user?.viewMode]);

  // Função para atualizar o viewMode tanto localmente quanto no banco
  const handleViewModeChange = async (newViewMode: 'year' | 'month') => {
    setViewMode(newViewMode);
    if (user) {
      await updateViewMode(newViewMode);
    }
  };

  useEffect(() => {
    isAuthenticated();
    reloadSummary();
  }, [isAuthenticated, reloadSummary, isAuthenticatedBoolean, pathname , router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex justify-center">
      <div className="w-full max-w-7xl px-6 flex flex-col gap-16">
        {isAuthenticatedBoolean && (
          <>
            <Nav />
            <Header viewMode={viewMode} setViewMode={handleViewModeChange} />
            <SummaryTable viewMode={viewMode} />
          </>
        )}
      </div>
    </div>
  );
}
