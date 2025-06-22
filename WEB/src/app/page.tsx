import { Header } from "@/components/Header";
import { Nav } from "@/components/Nav";
import { SummaryTable } from "@/components/SummaryTable";

export default function Home() {
  return (
    <div className="h-screen w-screen flex justify-center">
      <div className="w-full max-w-7xl px-6 flex flex-col gap-16">

        <Nav />
        <Header />
        <SummaryTable />

      </div>
    </div>
  );
}
