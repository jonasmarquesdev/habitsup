import * as Progress from "@radix-ui/react-progress";

interface ProgressBarProps {
  progress: number;
  max?: number;
}

export function ProgressBar({ progress, max = 100}: ProgressBarProps) {
  const safeProgress = Math.min(progress, max);

  return (
    <Progress.Root
      className="ProgressRoot h-3 rounded-xl bg-zinc-700 w-full mt-4 overflow-hidden"
      value={progress}
    >
      <Progress.Indicator
        className="ProgressIndicator h-3 rounded-xl bg-violet-600 transition-all"
        style={{ transform: `translateX(-${100 - (safeProgress / max) * 100}%)` }}
      />
    </Progress.Root>
  );
}
