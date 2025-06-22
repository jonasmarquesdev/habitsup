import * as Progress from "@radix-ui/react-progress";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar(props: ProgressBarProps) {
  return (
    <Progress.Root className="ProgressRoot h-3 rounded-xl bg-zinc-700 w-full mt-4 overflow-hidden" value={props.progress}>
			<Progress.Indicator
				className="ProgressIndicator h-3 rounded-xl bg-violet-600 transition-all"
				style={{ transform: `translateX(-${100 - props.progress}%)` }}
			/>
		</Progress.Root>
  );
}
