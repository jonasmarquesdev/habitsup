import * as Dialog from "@radix-ui/react-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState, useCallback, useRef } from "react";
import { Habit } from "@/interfaces/Habit";
import { CalendarDays, ListTodo, Trash2, AlertTriangle, X } from "lucide-react";
import { getHabits, deleteHabit } from "@/lib/actions/habits";
import { Button } from "./ui/button";
import { useSummary } from "@/contexts/SummaryContext";
import Loading from "./Loading";
import { Plus } from "phosphor-react";
import { NewHabitForm } from "./NewHabitForm";

export function ActivityModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNewHabit, setOpenNewHabit] = useState(false);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const { reloadSummary } = useSummary();

  // Estados para drag scroll
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Funções para drag scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    // Buscar o viewport interno do ScrollArea
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement;
    if (!viewport) return;

    // Não iniciar drag se clicar em botões ou elementos interativos (mas permitir em li)
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="toolbar"]')) {
      return;
    }

    setIsDragging(true);
    setStartY(e.pageY);
    setScrollTop(viewport.scrollTop);
    setDragDistance(0);
    document.body.style.cursor = "grabbing";
  };

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

  const handleHabitClick = (habitId: string) => {
    // Se foi um drag (distância > 5px), não tratar como clique
    if (dragDistance > 5) {
      return;
    }

    if (selectedHabitId === habitId) {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setSelectedHabitId(null);
        setIsAnimatingOut(false);
      }, 200);
    } else {
      setSelectedHabitId(habitId);
      setIsAnimatingOut(false);
    }
  };

  const hideSelectedHabit = useCallback(() => {
    if (selectedHabitId) {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setSelectedHabitId(null);
        setIsAnimatingOut(false);
      }, 200);
    }
  }, [selectedHabitId]);

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
    setSelectedHabitId(null);
    fetchHabits();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("li") && !target.closest('[role="toolbar"]')) {
        hideSelectedHabit();
      }
    };

    if (open && selectedHabitId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open, selectedHabitId, hideSelectedHabit]);

  // useEffect para eventos globais de drag scroll
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "auto";

      // Reset da distância do drag após um pequeno delay para permitir que o clique seja processado
      setTimeout(() => {
        setDragDistance(0);
      }, 100);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
      if (!viewport) return;

      e.preventDefault();
      const y = e.pageY;
      const distance = Math.abs(y - startY);
      setDragDistance(distance);

      const walk = (y - startY) * 1.5; // Velocidade de scroll
      viewport.scrollTop = scrollTop - walk;
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);

      return () => {
        document.removeEventListener("mouseup", handleGlobalMouseUp);
        document.removeEventListener("mousemove", handleGlobalMouseMove);
      };
    }
  }, [isDragging, startY, scrollTop]);

  // useEffect para controlar cursor e seleção durante o drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.userSelect = "auto";
      document.body.style.cursor = "auto";
    }

    // Cleanup quando o componente for desmontado
    return () => {
      document.body.style.userSelect = "auto";
      document.body.style.cursor = "auto";
    };
  }, [isDragging]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 min-w-[800px] max-w-[800px] min-h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-zinc-900 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-bold">
              Seus hábitos
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 p-1 hover:bg-zinc-800"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <ScrollArea
            ref={scrollAreaRef}
            className="h-[600px] w-full pr-6 pl-6 transition-all cursor-grab hover:cursor-grab"
            onMouseDown={handleMouseDown}
          >
            {loading ? (
              <div className="flex items-center justify-center min-h-[35rem] gap-4">
                <Loading />
                <span className="text-white">Carregando...</span>
              </div>
            ) : habits.length === 0 ? (
              <div className="text-center text-zinc-400 flex items-center justify-center min-h-[35rem]">
                Nenhum hábito cadastrado.
              </div>
            ) : (
              <ul className="space-y-4">
                {habits.map((habit) => (
                  <li
                    key={habit.id}
                    className="group relative flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3 shadow-sm hover:bg-zinc-700 transition cursor-pointer"
                    onClick={() => handleHabitClick(habit.id)}
                  >
                    {/* Item Info */}
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

                    {/* ToolBar Menu */}
                    {(selectedHabitId === habit.id ||
                      (isAnimatingOut && selectedHabitId === habit.id)) && (
                      <div
                        className={`p-1 z-10 absolute top-5 right-5 h-10 w-10 bg-zinc-900 border-zinc-800 rounded-lg flex items-center justify-center ${
                          isAnimatingOut
                            ? "animate-out slide-out-to-right-2 fade-out duration-200"
                            : "animate-in slide-in-from-right-2 fade-in duration-200"
                        }`}
                        role="toolbar"
                        aria-label="Ferramentas do hábito"
                        onClick={(e) => e.stopPropagation()}
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
                    )}
                  </li>
                ))}
                <li>
                  <div className="w-full max-w-4xl mx-auto flex items-center justify-end pb-3">
                    <Dialog.Root
                      open={openNewHabit}
                      onOpenChange={setOpenNewHabit}
                    >
                      <Dialog.Trigger
                        type="button"
                        className="group border border-violet-500 font-semibold rounded-lg px-6 py-4 w-full flex items-center justify-center gap-3 hover:border-violet-300 hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-none"
                      >
                        <Plus
                          size={20}
                          className="text-violet-500 group-hover:text-white transition-colors"
                        />
                        <span className="text-white transition-colors">
                          Novo hábito
                        </span>
                      </Dialog.Trigger>

                      <Dialog.Portal>
                        <Dialog.Overlay className="w-screen h-screen bg-black/80 fixed inset-0 z-[60]" />

                        <Dialog.Content className="fixed p-10 bg-zinc-900 rounded-2xl w-full max-w-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[70] shadow-2xl border border-zinc-700">
                          <Dialog.Close className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-200 transition-colors">
                            <X size={24} aria-label="close" />
                          </Dialog.Close>

                          <Dialog.Title className="text-3xl leading-tight font-extrabold">
                            Criar hábito
                          </Dialog.Title>

                          <NewHabitForm
                            onSuccess={() => {
                              setOpenNewHabit(false);
                              fetchHabits(); // Recarregar a lista de hábitos
                              reloadSummary(); // Recarregar o resumo também
                            }}
                          />
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                  </div>
                </li>
              </ul>
            )}
          </ScrollArea>
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
                Tem certeza que deseja excluir o hábito &ldquo;
                {habitToDelete?.title}&rdquo;?
                <br />
                <span className="text-red-500 font-medium">
                  Esta ação não pode ser desfeita.
                </span>
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
                  {deletingHabitId === habitToDelete?.id
                    ? "Excluindo..."
                    : "Excluir"}
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
