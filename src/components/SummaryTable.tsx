"use client";

import { generateDatesFromYearBeginning, generateDatesFromMonth } from "@/utils/generate-dates-from-year-beginning";

import { HabitDayBlock } from "./HabitDayBlock";
import dayjs from "dayjs";
import { useSummary } from "@/contexts/SummaryContext";
import { useEffect, useState, useRef } from "react";
import { CalendarBlank, CaretLeft, CaretRight } from "phosphor-react";
import { SummaryTableSkeleton } from "./SummaryTableSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

// Componente para botões de seleção de modo de view
export function ViewModeButtons({ 
  viewMode, 
  setViewMode 
}: { 
  viewMode: 'year' | 'month';
  setViewMode: (mode: 'year' | 'month') => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setViewMode('year')}
        className={`${viewMode === 'year' ? 'bg-violet-500 text-white' : ''} text-xs sm:text-sm font-medium`}
      >
        Ano
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setViewMode('month')}
        className={`${viewMode === 'month' ? 'bg-violet-500 text-white' : ''} text-xs sm:text-sm font-medium`}
      >
        Mês
      </Button>
    </div>
  );
}

interface SummaryTableProps {
  viewMode: 'year' | 'month';
}

export function SummaryTable({ viewMode }: SummaryTableProps) {
  const { summary, reloadSummary } = useSummary();
  const [isLoading, setIsLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const summaryDates = viewMode === 'year' 
    ? generateDatesFromYearBeginning() 
    : generateDatesFromMonth(currentYear, currentMonth);

  const minimumSummaryDatesSize = viewMode === 'year' ? 18 * 7 : 6 * 7; // 6 semanas para um mês
  const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;

  // Gerar os labels dos dias da semana dinamicamente baseado na primeira data
  const generateWeekDayLabels = () => {
    const weekDayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
    
    if (summaryDates.length === 0) {
      return weekDayLabels;
    }

    const firstDate = summaryDates[0];
    const firstDayOfWeek = dayjs(firstDate).utc().get('day');
    
    // Reorganizar os labels baseado no primeiro dia da semana
    const reorderedLabels = [];
    for (let i = 0; i < 7; i++) {
      const labelIndex = (firstDayOfWeek + i) % 7;
      reorderedLabels.push(weekDayLabels[labelIndex]);
    }
    
    return reorderedLabels;
  };

  const weekDays = generateWeekDayLabels();

  // Gerar lista de meses disponíveis (desde janeiro até o mês atual)
  const availableMonths = [];
  const today = dayjs();
  for (let month = 0; month <= today.month(); month++) {
    availableMonths.push({
      value: month,
      label: dayjs().month(month).format('MMMM'),
    });
  }

  // Gerar lista de anos disponíveis (desde 2024 até o ano atual)
  const availableYears = [];
  for (let year = 2024; year <= today.year(); year++) {
    availableYears.push({
      value: year,
      label: year.toString(),
    });
  }

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      if (currentYear > 2024) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(11);
      }
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const today = dayjs();
    if (currentMonth === 11) {
      if (currentYear < today.year()) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(0);
      }
    } else if (currentYear === today.year() && currentMonth < today.month()) {
      setCurrentMonth(currentMonth + 1);
    } else if (currentYear < today.year()) {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const canGoNext = () => {
    const today = dayjs();
    return currentYear < today.year() || 
           (currentYear === today.year() && currentMonth < today.month());
  };

  const canGoPrevious = () => {
    return currentYear > 2024 || 
           (currentYear === 2024 && currentMonth > 0);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      reloadSummary();
      setIsLoading(false);
    };

    loadData();
  }, [reloadSummary, currentYear, currentMonth, viewMode]);

  // Scroll automático para o final (dia atual) quando o componente carregar ou ao redimensionar a tela
  useEffect(() => {
    function scrollToToday() {
      if (!isLoading && scrollContainerRef.current && viewMode === 'year') {
        const today = dayjs().utc().format('YYYY-MM-DD');
        const blocks = Array.from(scrollContainerRef.current.querySelectorAll('.habit-day-block')) as HTMLElement[];
        let todayBlock: HTMLElement | null = null;
        for (const block of blocks) {
          const blockDate = block.getAttribute('data-date');
          if (blockDate === today) {
            todayBlock = block;
            break;
          }
        }
        if (todayBlock) {
          scrollContainerRef.current.scrollTo({
            left: todayBlock.offsetLeft - 40,
            behavior: 'smooth'
          });
        }
      }
    }

    const timeout = setTimeout(scrollToToday, 100);
    window.addEventListener('resize', scrollToToday);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', scrollToToday);
    };
  }, [isLoading, summary, viewMode]);

  if (isLoading) {
    return <SummaryTableSkeleton />;
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Controles de navegação */}
      {viewMode === 'month' && (
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                disabled={!canGoPrevious()}
                className="p-2"
              >
                <CaretLeft size={16} />
              </Button>
              
              <div className="flex items-center gap-2">
                <Select 
                  value={currentMonth.toString()} 
                  onValueChange={(value) => setCurrentMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-28 sm:w-32 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={currentYear.toString()} 
                  onValueChange={(value) => setCurrentYear(parseInt(value))}
                >
                  <SelectTrigger className="w-20 sm:w-24 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year.value} value={year.value.toString()}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={!canGoNext()}
                className="p-2"
              >
                <CaretRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de resumo */}
      <div className="w-full flex justify-center items-center habit-grid-container">
        {viewMode === 'year' ? (
          /* Layout com scroll horizontal para o ano */
          <div className="w-full max-w-full overflow-hidden">
            <div className="flex items-start">
              {/* Labels dos dias da semana - fixas na esquerda */}
              <div className="flex-shrink-0 grid grid-rows-7 grid-flow-row gap-3 select-none mr-3 sticky left-0 z-10 bg-zinc-950 py-3">
                {weekDays.map((weekDay, index) => (
                  <div
                    key={index}
                    className="text-zinc-400 text-sm sm:text-base md:text-xl h-8 w-8 sm:h-10 sm:w-10 font-bold flex items-center justify-center habit-weekday-label"
                  >
                    {weekDay}
                  </div>
                ))}
              </div>

              {/* Área com scroll horizontal */}
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar py-3"
              >
                <div className="grid grid-rows-7 grid-flow-col gap-3 relative z-0 min-w-max">
                  {summary.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                      <div className="flex items-center gap-2 bg-zinc-800 border text-zinc-400 rounded-lg p-3 shadow-lg">
                        <CalendarBlank size={24} className="text-zinc-400" />
                        <span className="font-medium text-sm md:text-base">
                          Nenhum hábito para este ano. Você pode criar novos!
                        </span>
                      </div>
                    </div>
                  )}

                  {summary.length > 0 ? (
                    <>
                      {summaryDates.map((date) => {
                        const dayInSummary = summary.find((day) => {
                          const summaryDate = dayjs(day.date).utc().format('YYYY-MM-DD');
                          const currentDate = dayjs(date).utc().format('YYYY-MM-DD');
                          return summaryDate === currentDate;
                        });
                        const currentDate = dayjs(date).utc().format('YYYY-MM-DD');
                        return (
                          <HabitDayBlock
                            key={date.toString()}
                            date={date}
                            amount={dayInSummary?.amount ?? 0}
                            defaultCompleted={dayInSummary?.completed}
                            data-date={currentDate}
                          />
                        );
                      })}

                      {amountOfDaysToFill > 0 &&
                        Array.from({ length: amountOfDaysToFill }).map((_, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 habit-day-block"
                          />
                        ))}
                    </>
                  ) : (
                    Array.from({ length: minimumSummaryDatesSize }).map((_, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed habit-day-block"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Layout padrão para o mês */
          <div className="flex items-start">
            <div className="grid grid-rows-7 grid-flow-row gap-3 select-none mr-3">
              {weekDays.map((weekDay, index) => (
                <div
                  key={index}
                  className="text-zinc-400 text-sm sm:text-base md:text-xl h-8 w-8 sm:h-10 sm:w-10 font-bold flex items-center justify-center habit-weekday-label"
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
                    <span className="font-medium text-sm md:text-base">
                      Nenhum hábito para este mês. Você pode criar novos!
                    </span>
                  </div>
                </div>
              )}

              {summary.length > 0 ? (
                <>
                  {summaryDates.map((date) => {
                    const dayInSummary = summary.find((day) => {
                      const summaryDate = dayjs(day.date).utc().format('YYYY-MM-DD');
                      const currentDate = dayjs(date).utc().format('YYYY-MM-DD');
                      return summaryDate === currentDate;
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
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 habit-day-block"
                      />
                    ))}
                </>
              ) : (
                Array.from({ length: minimumSummaryDatesSize }).map((_, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed habit-day-block"
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
