import { api } from "@/lib/axios";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "phosphor-react";
import { useEffect, useState } from "react";
import dayjs from "../lib/dayjs";
import clsx from "clsx";
import { useSummary } from "@/contexts/SummaryContext";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "@/contexts/UserContext";

interface HabitListProps {
  date: Date;
  onCompletedChanged: (completed: number) => void;
}

interface HabitInfo {
  possibleHabits: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
  completedHabits: Array<string>;
}

export function HabitList({ date, onCompletedChanged }: HabitListProps) {
  const [habitsInfo, setHabitsInfo] = useState<HabitInfo>();
  const { reloadSummary } = useSummary();
  const { getUsuario } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getUsuario().then((user) => {
      setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    api
      .get("day", {
        params: {
          date: date.toISOString(),
          userId: userId,
        },
      })
      .then((response) => {
        setHabitsInfo(response.data);
      });
  }, [date, userId]);

  async function handleToggleHabit(habitId: string) {
    api.patch(`/habits/${habitId}/toggle`);

    const isHabitAlreadyCompleted =
      habitsInfo!.completedHabits.includes(habitId);
    let completedHabits: string[] = [];

    if (isHabitAlreadyCompleted) {
      completedHabits = habitsInfo!.completedHabits.filter(
        (id) => id !== habitId
      );
    } else {
      completedHabits = [...habitsInfo!.completedHabits, habitId];
    }

    setHabitsInfo({
      possibleHabits: habitsInfo!.possibleHabits,
      completedHabits,
    });

    onCompletedChanged(completedHabits.length);
    reloadSummary();
  }

  const isDateInPast = dayjs(date).endOf("day").isBefore(new Date());

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
