import dayjs from "../lib/dayjs";

interface OrbProps {
  amount: number;
  completed: number;
  date: Date;
  style: string;
}

export function Orb({ amount, completed, date, style }: OrbProps) {
  const isDateInPast = dayjs(date)
    .utc()
    .startOf("day")
    .isBefore(dayjs().utc().startOf("day"));

  if (style === "violet") {
    return (
      <>
        {amount > 0 && !isDateInPast && completed === 0 && (
          <span className="flex h-4 w-4 items-center justify-center transition-all">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-violet-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
          </span>
        )}
        {!isDateInPast && amount === 0 && (
          <span className="flex h-4 w-4 items-center justify-center transition-all">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-yellow-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </span>
        )}
      </>
    );
  }

  if (style === "orange") {
    return (
      <span className="flex h-4 w-4 items-center justify-center transition-all">
        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-orange-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
      </span>
    );
  }

  return null;
}
