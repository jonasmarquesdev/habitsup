import * as Dialog from "@radix-ui/react-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

export function ActivityModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { getUsuario } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const fetchHabits = async () => {
      setLoading(true);
      const user = await getUsuario();
      if (!user?.id) return;
      const res = await api.get("/summary", { params: { userId: user.id } });
      setHabits(res.data);
      console.log("Habits fetched:", res.data);
      setLoading(false);
    };
    fetchHabits();
  }, [open, getUsuario]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-zinc-900 p-6 shadow-lg">
          <Dialog.Title className="text-xl font-bold mb-4">Seus hábitos</Dialog.Title>
          <ScrollArea className="h-80 w-full pr-2">
            {loading ? (
              <div className="text-center text-zinc-400">Carregando...</div>
            ) : habits.length === 0 ? (
              <div className="text-center text-zinc-400">Nenhum hábito cadastrado.</div>
            ) : (
              <ul className="space-y-4">
                {habits.map((habit) => (
                  <li key={habit.id} className="border-b border-zinc-800 pb-2">
                    <div className="font-semibold">{habit.title}</div>
                    <div className="text-xs text-zinc-400">
                      Dias cadastrados:{" "}
                      {habit.weekDays?.map((d: any) => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.week_day]).join(", ")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
          <Dialog.Close asChild>
            <button className="mt-4 w-full rounded bg-violet-600 py-2 text-white font-semibold hover:bg-violet-500 transition">Fechar</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}