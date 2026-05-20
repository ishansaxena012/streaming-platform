export function ProfileLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10">
      {/* Title Shimmer */}
      <div className="w-80 h-10 rounded shimmer-bg" style={{ animationDuration: "2s" }} />
      
      {/* Profiles Shimmer Slots */}
      <div className="flex flex-wrap justify-center gap-8">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex flex-col items-center gap-4">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg shimmer-bg border border-white/5 shadow-md"
              style={{ animationDelay: `${idx * 0.15}s` }}
            />
            <div className="w-20 h-5 rounded shimmer-bg" />
          </div>
        ))}
      </div>
    </div>
  );
}
