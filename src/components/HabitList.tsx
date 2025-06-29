import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "phosphor-react";
import { useEffect, useState, useRef } from "react";
import dayjs from "../lib/dayjs";
import clsx from "clsx";
import { useSummary } from "@/contexts/SummaryContext";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";
import { showToastMessage } from "./ToastMessage";
import { getDay, toggleHabit } from "@/lib/actions/habits";

interface HabitListInfo {
  possibleHabits: {
    id: string;
    title: string;
    created_at: Date;
    userId: string;
  }[];
  completedHabits: string[];
}

interface HabitListProps {
  date: Date;
  onCompletedChanged: (completed: number) => void;
}

export function HabitList({ date, onCompletedChanged }: HabitListProps) {
  const [habitsInfo, setHabitsInfo] = useState<HabitListInfo | undefined>(
    undefined
  );
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

    // Não iniciar drag se clicar em elementos interativos
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="checkbox"]')) {
      return;
    }

    setIsDragging(true);
    setStartY(e.pageY);
    setScrollTop(viewport.scrollTop);
    setDragDistance(0);
    document.body.style.cursor = "grabbing";
  };

  useEffect(() => {
    async function fetchHabits() {
      try {
        const result = await getDay(date);
        if (result.success) {
          setHabitsInfo(result.data);
        } else {
          console.error("Erro ao buscar hábitos:", result.message);
        }
      } catch (error) {
        console.error("Erro ao buscar hábitos:", error);
      }
    }
    fetchHabits();
  }, [date]);

  // useEffect para eventos globais de drag scroll
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "auto";

      // Reset da distância do drag após um pequeno delay
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

  async function handleToggleHabit(habitId: string) {
    if (!habitsInfo) return;

    // Se foi um drag (distância > 5px), não tratar como clique
    if (dragDistance > 5) {
      return;
    }

    // Salve o estado anterior
    const prevHabitsInfo = { ...habitsInfo };

    // Optimistic update
    const isHabitAlreadyCompleted =
      habitsInfo.completedHabits.includes(habitId);
    let completedHabits: string[];

    if (isHabitAlreadyCompleted) {
      completedHabits = habitsInfo.completedHabits.filter(
        (id) => id !== habitId
      );
    } else {
      completedHabits = [...habitsInfo.completedHabits, habitId];
    }

    setHabitsInfo({
      possibleHabits: habitsInfo.possibleHabits,
      completedHabits,
    });

    onCompletedChanged(completedHabits.length);

    try {
      const result = await toggleHabit(habitId);

      if (result.success) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        reloadSummary();

        if (
          !isHabitAlreadyCompleted &&
          completedHabits.length === habitsInfo.possibleHabits.length &&
          completedHabits.length > 0
        ) {
          showToastMessage({
            message: "Parabéns! Você completou todos os hábitos do dia!",
            type: "success",
          });
        } else {
          showToastMessage({
            message: "Hábito atualizado com sucesso!",
            type: "success",
          });
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      // Rollback
      showToastMessage({
        message: `Erro ao atualizar hábito: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        type: "error",
      });
      setHabitsInfo(prevHabitsInfo);
      onCompletedChanged(prevHabitsInfo.completedHabits.length);
    }
  }

  const isDateInPast = dayjs(date)
    .utc()
    .startOf("day")
    .isBefore(dayjs().utc().startOf("day"));

  return (
    <div
      className={clsx("mt-6 flex flex-col gap-3", {
        "opacity-50": isDateInPast,
      })}
    >
      {!habitsInfo ? (
        <>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-40 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-36 rounded" />
          </div>
        </>
      ) : (
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[180px] w-full cursor-grab hover:cursor-grab flex-shrink-0"
          onMouseDown={handleMouseDown}
        >
          <ul className="p-1 flex flex-col gap-3">
            {habitsInfo.possibleHabits.map((habit) => (
              <li key={habit.id}>
                <Checkbox.Root
                  onCheckedChange={() => handleToggleHabit(habit.id)}
                  checked={habitsInfo.completedHabits.includes(habit.id)}
                  disabled={isDateInPast}
                  className="flex items-center gap-3 group disabled:cursor-not-allowed"
                >
                  <div className="h-8 w-8 flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 rounded-lg group-data-[state=checked]:bg-green-500 transition-colors group-focus:ring-2 group-focus:ring-violet-500 group-focus:ring-offset-2 group-focus:ring-offset-background">
                    <Checkbox.Indicator>
                      <Check size={20} className="text-white" />
                    </Checkbox.Indicator>
                  </div>
                  <span className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
                    {habit.title}
                  </span>
                </Checkbox.Root>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
