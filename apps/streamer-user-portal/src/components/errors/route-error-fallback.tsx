import { AlertCircle, RotateCcw } from "lucide-react";

export function RouteErrorFallback() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-5">
      <div className="p-3 rounded-full bg-netflix-red/10 text-netflix-red border border-netflix-red/20">
        <AlertCircle className="w-8 h-8" />
      </div>
      
      <div className="space-y-1.5">
        <h4 className="font-bold text-white text-sm">This page couldn't load</h4>
        <p className="text-xs text-cinema-gray max-w-xs leading-relaxed">
          A new version may have just gone live. Reloading usually fixes it.
        </p>
      </div>

      <button
        onClick={handleReload}
        className="inline-flex items-center gap-2 py-2 px-4 rounded-md bg-netflix-red hover:bg-red-700 transition-all text-white font-semibold text-xs shadow-lg shadow-netflix-red/20 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reload
      </button>
    </div>
  );
}
export default RouteErrorFallback;
