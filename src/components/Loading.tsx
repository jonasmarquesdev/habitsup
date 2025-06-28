import { Loader2Icon } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2Icon className="animate-spin text-violet-500" size={24} />
        </div>
    );
}