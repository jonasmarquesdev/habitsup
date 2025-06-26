"use client";

import { generateDatesFromYearBeginning } from "@/utils/generate-dates-from-year-beginning";

import { HabitDayBlock } from "./HabitDayBlock";
import dayjs from "dayjs";
import { useSummary } from "@/contexts/SummaryContext";
import { useEffect, useState } from "react";
import { CalendarBlank } from "phosphor-react";
import { SummaryTableSkeleton } from "./SummaryTableSkeleton";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

const summaryDates = generateDatesFromYearBeginning();
const minimumSummaryDatesSize = 18 * 7;
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;

export function SummaryTable() {
  const { summary, reloadSummary } = useSummary();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await reloadSummary();
      setIsLoading(false);
    };

    loadData();
  }, [reloadSummary]);

  if (isLoading) {
    return <SummaryTableSkeleton />;
  }

  return (
    <div className="w-full flex justify-center items-center">
      <div className="grid grid-rows-7 grid-flow-row gap-3">
        {weekDays.map((weekDay, index) => (
          <div
            key={index}
            className="text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center"
          >
            {weekDay}
          </div>
        ))}
      </div>

      <div className="grid grid-rows-7 grid-flow-col gap-3 relative z-0">
        {summary.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="flex items-center gap-2 bg-zinc-800 border text-zinc-400 rounded-lg p-3 shadow-lg">
              <CalendarBlank size={24} className="text-zinc-400" />
              <span className="font-medium">
                Nenhuma activity para hoje. Você pode criar novas!
              </span>
            </div>
          </div>
        )}

        {summary.length > 0 ? (
          <>
            {summaryDates.map((date) => {
              const dayInSummary = summary.find((day) => {
                return dayjs(date).isSame(day.date, "day");
              });

              return (
                <HabitDayBlock
                  key={date.toString()}
                  date={date}
                  amount={dayInSummary?.amount ?? 0}
                  defaultCompleted={dayInSummary?.completed}
                />
              );
            })}

            {amountOfDaysToFill > 0 &&
              Array.from({ length: amountOfDaysToFill }).map((_, index) => (
                <div
                  key={index}
                  className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
                />
              ))}
          </>
        ) : (
          Array.from({ length: minimumSummaryDatesSize }).map((_, index) => (
            <div
              key={index}
              className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
            />
          ))
        )}
      </div>
    </div>
  );
}
