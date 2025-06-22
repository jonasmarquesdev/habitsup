"use client"

import { createContext, useContext, useState, useCallback } from "react";
import { api } from "@/lib/axios";
import { Summary } from "@/types/summary";

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
    const response = await api.get("/summary");
    setSummary(response.data);
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