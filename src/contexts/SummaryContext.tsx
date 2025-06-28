"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Summary } from "@/types/summary";
import { getSummary } from "@/lib/actions/habits";
import dayjs from "@/lib/dayjs";

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
