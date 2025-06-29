"use client";

import * as Popover from "@radix-ui/react-popover";
import { ProgressBar } from "./ProgressBar";
import clsx from "clsx";
import dayjs from "../lib/dayjs";
import { HabitList } from "./HabitList";
import { useState } from "react";
import { WarningCircle, CheckCircle } from "phosphor-react";
import type { HabitDay } from "@/interfaces/HabitDay";
import { Orb } from "./Orb";

export function HabitDayBlock({
  amount,
  defaultCompleted = 0,
  date,
}: HabitDay) {
  const [completed, setCompleted] = useState(defaultCompleted);

  // Normalize date to UTC to avoid timezone issues
  const normalizedDate = dayjs(date).utc().startOf('day');
  const isDateInPast = normalizedDate.isBefore(dayjs().utc().startOf('day'));

  const completedPercentage =
    amount > 0 ? Math.round((completed / amount) * 100) : 0;
  const dayAndMonth = normalizedDate.format("DD/MM");
  const dayOfWeek = normalizedDate.locale("pt-br").format("dddd").toLowerCase();

  function handleCompletedChanged(completed: number) {
    setCompleted(completed);
  }

  return (
    <Popover.Root>
      <Popover.Trigger
        className={clsx(
          "w-10 h-10 border-2 rounded-lg transition-colors relative flex items-center justify-center",
          {
            "bg-zinc-900 border-zinc-800": completedPercentage === 0,
            "bg-violet-900 border-violet-700":
              completedPercentage > 0 && completedPercentage < 20,
            "bg-violet-800 border-violet-600":
              completedPercentage >= 20 && completedPercentage < 40,
            "bg-violet-700 border-violet-500":
              completedPercentage >= 40 && completedPercentage < 60,
            "bg-violet-600 border-violet-500":
              completedPercentage >= 60 && completedPercentage < 80,
            "bg-violet-500 border-violet-400": completedPercentage >= 80,
            "cursor-pointer": true,
          }
        )}
      >
        <Orb amount={amount} completed={completed} date={date} style="violet" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className="min-w-[340px] p-6 bg-zinc-900 rounded-2xl flex flex-col transition-all">
          <span className="font-semibold text-zinc-400">{dayOfWeek}</span>
          <span className="mt-1 font-extrabold leading-tight text-3xl">
            {dayAndMonth}
          </span>

          <ProgressBar progress={completedPercentage} />

          {isDateInPast && (
            <div className="flex items-center justify-center mt-6 gap-1">
              <WarningCircle size={20} className="text-red-800" />
              <span className="text-red-800">
                Não é possível modificar hábito de dias anteriores
              </span>
            </div>
          )}

          {!isDateInPast && completed === amount && amount > 0 && (
            <div className="flex items-center justify-center mt-6 gap-1">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-green-500">
                Você concluiu todas hábitos de hoje!
              </span>
            </div>
          )}

          {!isDateInPast && amount === 0 && (
            <div className="flex items-center justify-center mt-6 gap-1">
              <WarningCircle size={20} className="text-yellow-500" />
              <span className="text-yellow-500">
                Nenhum hábito para hoje. Você pode criar novos!
              </span>
            </div>
          )}

          <HabitList date={date} onCompletedChanged={handleCompletedChanged} />

          <Popover.Arrow height={8} width={16} className="fill-zinc-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
