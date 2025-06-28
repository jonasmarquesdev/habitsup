"use client";

import { Header } from "@/components/Header";
import { Nav } from "@/components/Nav";
import { SummaryTable } from "@/components/SummaryTable";
import { useSummary } from "@/contexts/SummaryContext";
import { useAuth } from "@/contexts/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isAuthenticatedBoolean } = useAuth();
  const { reloadSummary } = useSummary();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    isAuthenticated();
    if (!isAuthenticatedBoolean) {
      if (pathname !== "/login" && pathname !== "/register") {
        router.push("/login");
      }
      return;
    }
    reloadSummary();
  }, [isAuthenticated, reloadSummary, isAuthenticatedBoolean, pathname , router]);

  return (
    <div className="h-screen w-screen flex justify-center">
      <div className="w-full max-w-7xl px-6 flex flex-col gap-16">
        {isAuthenticatedBoolean && (
          <>
            <Nav />
            <Header />
            <SummaryTable />
          </>
        )}
      </div>
    </div>
  );
}
