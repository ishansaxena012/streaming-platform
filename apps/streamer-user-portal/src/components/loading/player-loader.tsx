import { Loader2 } from "lucide-react";

interface PlayerLoaderProps {
  message?: string;
}

export function PlayerLoader({ message = "Loading stream..." }: PlayerLoaderProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30 pointer-events-none">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-12 h-12 text-netflix-red animate-spin drop-shadow-[0_0_8px_#E50914]" />
        <span className="text-white/80 font-medium tracking-wider text-xs uppercase animate-pulse">
          {message}
        </span>
      </div>
    </div>
  );
}
