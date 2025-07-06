import { generateDatesFromYearBeginning } from "@/utils/generate-dates-from-year-beginning";
import dayjs from "dayjs";

export function SummaryTableSkeleton() {
  const summaryDates = generateDatesFromYearBeginning();
  const minimumSummaryDatesSize = 18 * 7;

  // Gerar os labels dos dias da semana dinamicamente baseado na primeira data
  const generateWeekDayLabels = () => {
    const weekDayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
    
    if (summaryDates.length === 0) {
      return weekDayLabels;
    }

    const firstDate = summaryDates[0];
    const firstDayOfWeek = dayjs(firstDate).utc().get('day'); // 0 = Sunday, 1 = Monday, etc.
    
    // Reorganizar os labels baseado no primeiro dia da semana
    const reorderedLabels = [];
    for (let i = 0; i < 7; i++) {
      const labelIndex = (firstDayOfWeek + i) % 7;
      reorderedLabels.push(weekDayLabels[labelIndex]);
    }
    
    return reorderedLabels;
  };

  const weekDays = generateWeekDayLabels();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Skeleton para controles de navegação */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-12 bg-zinc-700 rounded animate-pulse"></div>
          <div className="h-8 w-12 bg-zinc-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Skeleton para tabela */}
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

        <div className="grid grid-rows-7 grid-flow-col gap-3">
          {Array.from({ length: minimumSummaryDatesSize }).map((_, index) => (
            <div
              key={index}
              className="w-10 h-10 bg-zinc-800 border-2 border-zinc-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}