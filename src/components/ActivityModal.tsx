import * as Dialog from "@radix-ui/react-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";
import { Habit } from "@/interfaces/Habit";
import { CalendarDays, ListTodo } from "lucide-react";
import { getHabits } from "@/lib/actions/habits";

export function ActivityModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const fetchHabits = async () => {
      setLoading(true);
      try {
        const result = await getHabits();
        if (result.success && result.habits) {
          setHabits(result.habits as Habit[]);
        } else {
          console.error("Erro ao buscar hábitos:", result.message);
          setHabits([]);
        }
      } catch (error) {
        console.error("Erro ao buscar hábitos:", error);
        setHabits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-zinc-900 p-6 shadow-lg">
          <Dialog.Title className="text-xl font-bold mb-4">
            Seus hábitos
          </Dialog.Title>
          <ScrollArea className="h-80 w-full pr-6 pl-6">
            {loading ? (
              <div className="text-center text-zinc-400">Carregando...</div>
            ) : habits.length === 0 ? (
              <div className="text-center text-zinc-400">
                Nenhum hábito cadastrado.
              </div>
            ) : (
              <ul className="space-y-4">
                {habits.map((habit) => (
                  <li
                    key={habit.id}
                    className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3 shadow-sm hover:bg-zinc-700 transition"
                  >
                    <div className="flex flex-col justify-center gap-2">
                      <div className="flex items-center gap-2 font-semibold text-violet-400">
                        <ListTodo className="w-5 h-5" />
                        {habit.title}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                        <CalendarDays className="w-4 h-4" />
                        <span>
                          Dias cadastrados:{" "}
                          {habit.weekDays
                            ?.map(
                              (d: { week_day: number }) =>
                                [
                                  "Dom",
                                  "Seg",
                                  "Ter",
                                  "Qua",
                                  "Qui",
                                  "Sex",
                                  "Sáb",
                                ][d.week_day]
                            )
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
          <Dialog.Close asChild>
            <button className="mt-4 w-full rounded bg-violet-600 py-2 text-white font-semibold hover:bg-violet-500 transition">
              Fechar
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
