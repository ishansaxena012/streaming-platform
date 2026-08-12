import { WifiOff, RotateCcw } from "lucide-react";

interface NetworkErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export function NetworkErrorState({ onRetry, message = "We couldn't reach the server" }: NetworkErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-xl glass-panel border border-white/5 max-w-sm mx-auto text-center space-y-5">
      <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <WifiOff className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h4 className="font-bold text-white text-sm">Connection lost</h4>
        <p className="text-xs text-cinema-gray leading-relaxed">
          {message}. Check your internet connection and try again.
        </p>
      </div>

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 py-2 px-4 rounded-md bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white font-semibold text-xs border border-white/5 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Retry Connection
      </button>
    </div>
  );
}
