import { useQuery } from "@tanstack/react-query";
import { contentService } from "../../../services/content";
import { MovieCard } from "../../recommendations/components/movie-card";
import { useUiStore } from "../../../store/ui.store";
import { AlertCircle, Film, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SearchGridProps {
  debouncedQuery: string;
}

export function SearchGrid({ debouncedQuery }: SearchGridProps) {
  const { setSearchQuery } = useUiStore();

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ["movies-search", debouncedQuery],
    queryFn: ({ signal }) => contentService.searchMovies(debouncedQuery, signal),
    enabled: debouncedQuery.length > 0,
  });

  const recommendationTags = ["Tears of Steel", "Sci-Fi & Fantasy", "Action & Adventure", "Documentaries", "2025"];

  if (debouncedQuery.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 select-none max-w-md mx-auto px-4">
        <div className="p-4 rounded-full bg-white/5 border border-white/5 text-netflix-red shadow-lg shadow-netflix-red/5">
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold tracking-wide text-white">Discover Portal Content</h3>
          <p className="text-sm text-cinema-gray leading-relaxed">
            Search for your favorite films, trailers, categories, directors, and quality formats instantly.
          </p>
        </div>
        
        {/* Recommendation suggestions tags */}
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-cinema-gray">Popular Searches</span>
          <div className="flex flex-wrap justify-center gap-2">
            {recommendationTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="py-1.5 px-3 bg-white/5 hover:bg-netflix-red hover:text-white border border-white/5 hover:border-netflix-red rounded-full text-xs text-cinema-gray font-semibold transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 sm:px-6 md:px-8 py-8 select-none">
        <div className="w-64 h-6 rounded shimmer-bg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[16/9] rounded-lg shimmer-bg border border-white/5"
              style={{ animationDelay: `${idx * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-3 px-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <h4 className="font-bold text-white text-sm">Failed to search catalog</h4>
        <p className="text-xs text-cinema-gray">Verify local server API connectivity.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 max-w-sm mx-auto px-4 select-none">
        <div className="p-4 rounded-full bg-white/5 border border-white/5 text-cinema-gray shadow-lg">
          <Film className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-extrabold tracking-wide text-white">No results found</h3>
          <p className="text-xs text-cinema-gray leading-relaxed">
            We couldn't locate any matching titles for <span className="text-white font-bold">"{debouncedQuery}"</span>. Try typing alternative genres or check spelling.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-8 select-none">
      <h3 className="text-base sm:text-lg font-black tracking-wider text-white">
        Search Results for <span className="text-netflix-red">"{debouncedQuery}"</span> ({results.length} found)
      </h3>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
      >
        {results.map((movie) => (
          <div key={movie.id} className="h-full">
            <MovieCard movie={movie} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
export default SearchGrid;
