"use client";

import { useSummary } from "@/contexts/SummaryContext";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "phosphor-react";
import { useState } from "react";
import { showToastMessage, showToastPromise } from "./ToastMessage";
import { createHabit } from "@/lib/actions/habits";

const availableWeekDays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function NewHabitForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState("");
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const { reloadSummary } = useSummary();

  async function createNewHabit(event: React.FormEvent) {
    event.preventDefault();

    if (!title || weekDays.length === 0) {
      showToastMessage({
        message: "Preencha o título e selecione pelo menos um dia da semana.",
        type: "error",
      });
      return;
    }

    const habitPromise = createHabit(title, weekDays).then((result) => {
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    });

    showToastPromise(habitPromise, {
      loading: "Salvando activity...",
      success: "Activity criada com sucesso!",
      error: "Erro ao criar activity.",
    });

    try {
      await habitPromise;
      setTitle("");
      setWeekDays([]);
      await reloadSummary();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    }
  }

  function handleToggleWeekDay(weekDayIndexSelected: number) {
    if (weekDays.includes(weekDayIndexSelected)) {
      const weekDayWithRemovedOne = weekDays.filter(
        (day) => day !== weekDayIndexSelected
      );
      setWeekDays(weekDayWithRemovedOne);
    } else {
      const weekDayWithAddedOne = [...weekDays, weekDayIndexSelected];
      setWeekDays(weekDayWithAddedOne);
    }
  }

  return (
    <form onSubmit={createNewHabit} className="w-full flex flex-col mt-6">
      <label htmlFor="title" className="font-semibold leading-tight">
        Qual seu comprometimento?
      </label>

      <input
        type="text"
        id="title"
        placeholder="ex.: Exercícios, dormir bem, etc..."
        className="p-4 rounded-lg mt-3 bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label htmlFor="" className="font-semibold leading-tight mt-4">
        Qual a recorrência?
      </label>

      <div className="mt-3 flex flex-col gap-3">
        {availableWeekDays.map((weekDay, index) => (
          <Checkbox.Root
            key={weekDay}
            className="flex items-center gap-3 group focus:outline-none"
            checked={weekDays.includes(index)}
            onCheckedChange={() => handleToggleWeekDay(index)}
          >
            <div className="h-8 w-8 flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 rounded-lg group-data-[state=checked]:bg-green-500 transition-colors group-focus:ring-2 group-focus:ring-violet-500 group-focus:ring-offset-2 group-focus:ring-offset-background">
              <Checkbox.Indicator>
                <Check size={20} className="text-white" />
              </Checkbox.Indicator>
            </div>

            <span className="text-white leading-tight">{weekDay}</span>
          </Checkbox.Root>
        ))}
      </div>

      <button
        type="submit"
        className="mt-6 rounded-lg p-4 flex items-center justify-center gap-3 font-semibold bg-green-600 hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-background"
      >
        <Check size={20} weight="bold" />
        Confirmar
      </button>
    </form>
  );
}
