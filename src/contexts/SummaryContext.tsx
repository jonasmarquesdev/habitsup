"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Summary } from "@/types/summary";
import { getSummary } from "@/lib/actions/habits";

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

  const reloadSummary = useCallback(async () => {
    try {
      const result = await getSummary();
      if (result.success) {
        setSummary(result.data as Summary);
      } else {
        setSummary([]);
        console.error("Erro ao carregar resumo:", result.message);
      }
    } catch (error) {
      setSummary([]);
      console.error("Erro ao carregar resumo:", error);
    }
  }, []);

  return (
    <SummaryContext.Provider value={{ summary, reloadSummary }}>
      {children}
    </SummaryContext.Provider>
  );
}

export function useSummary() {
  return useContext(SummaryContext);
}
