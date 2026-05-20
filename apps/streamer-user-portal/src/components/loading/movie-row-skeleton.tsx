export function MovieRowSkeleton() {
  return (
    <div className="py-6 space-y-4">
      {/* Category Title Shimmer */}
      <div className="w-56 h-7 rounded shimmer-bg" style={{ animationDuration: "2s" }} />
      
      {/* Cards Row Shimmer Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="aspect-[16/9] rounded-lg shadow-lg border border-white/5 shimmer-bg"
            style={{ animationDelay: `${idx * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}
