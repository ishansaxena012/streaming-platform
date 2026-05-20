import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../config/routes";

interface PlayerErrorFallbackProps {
  onRetry: () => void;
  errorMsg?: string;
}

export function PlayerErrorFallback({ onRetry, errorMsg = "Decode or network stream failure occurred" }: PlayerErrorFallbackProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-40 text-center px-4">
      <div className="max-w-md w-full p-6 glass-panel rounded-xl border border-netflix-red/10 space-y-5">
        <div className="inline-flex p-3 rounded-full bg-netflix-red/10 text-netflix-red border border-netflix-red/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-wide">Playback Interrupted</h3>
          <p className="text-cinema-gray text-xs leading-relaxed max-w-xs mx-auto">
            {errorMsg}. Make sure your local internet settings are valid.
          </p>
        </div>
        
        <div className="flex gap-4 max-w-xs mx-auto">
          <Link
            to={ROUTES.HOME}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-white/5 hover:bg-white/10 transition-all text-white border border-white/5 font-semibold text-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-netflix-red hover:bg-red-700 transition-all text-white font-semibold text-xs shadow-lg shadow-netflix-red/20 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Stream
          </button>
        </div>
      </div>
    </div>
  );
}
