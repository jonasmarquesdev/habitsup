"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Summary } from "@/types/summary";
import { getSummary } from "@/lib/actions/habits";
import { useAuth } from "./UserContext";
import dayjs from "@/lib/dayjs";
import { useRouter } from "next/navigation";

interface SummaryContextProps {
  summary: Summary;
  reloadSummary: () => Promise<void>;
}

const SummaryContext = createContext<SummaryContextProps>({
  summary: [],
  reloadSummary: async () => {},
});

export function SummaryProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<Summary>([]);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const reloadSummary = useCallback(async () => {
    if (!isAuthenticated || !isAuthenticated()) {
      setSummary([]);
      router.push("/login");
      return;
    }
    try {
      const result = await getSummary();
      if (result.success) {
        // Normalize dates to UTC to ensure consistency
        const normalizedSummary = (result.data as Summary).map(item => ({
          ...item,
          date: typeof item.date === 'string' ? item.date : dayjs(item.date).utc().toISOString()
        }));
        setSummary(normalizedSummary);
      } else {
        setSummary([]);
        console.error("Erro ao carregar resumo:", result.message);
      }
    } catch (error) {
      setSummary([]);
      console.error("Erro ao carregar resumo:", error);
    }
  }, [isAuthenticated, router]);

  return (
    <SummaryContext.Provider value={{ summary, reloadSummary }}>
      {children}
    </SummaryContext.Provider>
  );
}

export function useSummary() {
  return useContext(SummaryContext);
}
