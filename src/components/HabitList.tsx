import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "phosphor-react";
import { useEffect, useState } from "react";
import dayjs from "../lib/dayjs";
import clsx from "clsx";
import { useSummary } from "@/contexts/SummaryContext";
import { Skeleton } from "./ui/skeleton";
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
  const [habitsInfo, setHabitsInfo] = useState<HabitListInfo | undefined>(undefined);
  const { reloadSummary } = useSummary();

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

  async function handleToggleHabit(habitId: string) {
    if (!habitsInfo) return;

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
        await new Promise(resolve => setTimeout(resolve, 300));
        reloadSummary();

        if (
          !isHabitAlreadyCompleted &&
          completedHabits.length === habitsInfo.possibleHabits.length &&
          completedHabits.length > 0
        ) {
          showToastMessage({
            message: "Parabéns! Você completou todas as activity do dia!",
            type: "success",
          });
        } else {
          showToastMessage({
            message: "Activity atualizada com sucesso!",
            type: "success",
          });
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      // Rollback
      showToastMessage({
        message: `Erro ao atualizar activity: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        type: "error",
      });
      setHabitsInfo(prevHabitsInfo);
      onCompletedChanged(prevHabitsInfo.completedHabits.length);
    }
  }

  const isDateInPast = dayjs(date).startOf('day').isBefore(dayjs().startOf('day'));

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
        habitsInfo.possibleHabits.map((habit) => (
          <Checkbox.Root
            key={habit.id}
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
        ))
      )}
    </div>
  );
}
