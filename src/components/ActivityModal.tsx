import * as Dialog from "@radix-ui/react-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";
import { Habit } from "@/interfaces/Habit";
import { CalendarDays, ListTodo, Trash2, AlertTriangle, X } from "lucide-react";
import { getHabits, deleteHabit } from "@/lib/actions/habits";
import { Button } from "./ui/button";
import { useSummary } from "@/contexts/SummaryContext";

export function ActivityModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const { reloadSummary } = useSummary();

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

  const handleDeleteClick = (habit: Habit) => {
    setHabitToDelete(habit);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!habitToDelete) return;

    setDeletingHabitId(habitToDelete.id);
    setConfirmDialogOpen(false);
    
    try {
      const result = await deleteHabit(habitToDelete.id);
      if (result.success) {
        reloadSummary();
        await fetchHabits();
      } else {
        alert(result.message || "Erro ao excluir hábito");
      }
    } catch (error) {
      console.error("Erro ao excluir hábito:", error);
      alert("Erro ao excluir hábito");
    } finally {
      setDeletingHabitId(null);
      setHabitToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setHabitToDelete(null);
  };

  useEffect(() => {
    if (!open) return;
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
                    className="group relative flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3 shadow-sm hover:bg-zinc-700 transition"
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
                    <div
                      className="p-1 z-10 absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all h-10 w-10 bg-zinc-900 border-zinc-800 rounded-lg flex items-center justify-center"
                      role="toolbar"
                      aria-label="Ferramentas do hábito"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 text-zinc-400 hover:text-red-400 hover:bg-red-700/50 rounded-lg border-2"
                        aria-label="Excluir hábito"
                        disabled={deletingHabitId === habit.id}
                        onClick={() => handleDeleteClick(habit)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
      
      {/* Dialog de confirmação de exclusão */}
      <Dialog.Root open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <Dialog.Title className="text-lg font-semibold text-red-600">
                  Confirmar exclusão
                </Dialog.Title>
              </div>
              
              <Dialog.Description className="text-sm text-zinc-600 dark:text-zinc-400">
                Tem certeza que deseja excluir o hábito &ldquo;{habitToDelete?.title}&rdquo;?
                <br />
                <span className="text-red-500 font-medium">Esta ação não pode ser desfeita.</span>
              </Dialog.Description>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
                <Button 
                  variant="outline" 
                  onClick={handleCancelDelete}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleConfirmDelete}
                  disabled={deletingHabitId === habitToDelete?.id}
                  className="w-full sm:w-auto bg-red-600/70"
                >
                  {deletingHabitId === habitToDelete?.id ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </div>

            <Dialog.Close asChild>
              <button 
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-zinc-950 dark:focus:ring-zinc-300"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Root>
  );
}
