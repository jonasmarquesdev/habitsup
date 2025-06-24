"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { api } from "@/lib/axios";
import { Summary } from "@/types/summary";
import { useAuth } from "./UserContext";

interface SummaryContextProps {
  summary: Summary;
  reloadSummary: () => Promise<void>;
}

const SummaryContext = createContext<SummaryContextProps>({
  summary: [],
  reloadSummary: async () => {},
});

export function SummaryProvider({ children }: { children: React.ReactNode }) {
  const { getUsuario } = useAuth();
  const [summary, setSummary] = useState<Summary>([]);

  const reloadSummary = useCallback(async () => {
    const currentUser = await getUsuario();
    const response = await api.get(`/summary?userId=${currentUser.id}`);
    setSummary(response.data);

    console.log("Summary reloaded:", response.data);
  }, [getUsuario]);

  return (
    <SummaryContext.Provider value={{ summary, reloadSummary }}>
      {children}
    </SummaryContext.Provider>
  );
}

export function useSummary() {
  return useContext(SummaryContext);
}
