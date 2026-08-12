import type { Movie } from "../../../types";
import { MovieCard } from "./movie-card";
import { MovieRowSkeleton } from "../../../components/loading/movie-row-skeleton";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
}

export function MovieRow({ title, movies, loading = false }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollOffset = direction === "left" 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      rowRef.current.scrollTo({
        left: scrollOffset,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return <MovieRowSkeleton />;
  }

  if (movies.length === 0) return null;

  return (
    <div className="py-6 space-y-3 relative group select-none">
      <h3 className="text-base sm:text-xl font-bold text-white px-4 md:px-0">
        {title}
      </h3>

      <div className="relative">
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 bg-black/60 hover:bg-black/80 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-r border-white/5 cursor-pointer text-white"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transform hover:scale-[1.2] transition-transform" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden py-3 px-4 md:px-0 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="w-[180px] sm:w-[240px] md:w-[280px] flex-shrink-0"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        <button
          onClick={() => handleScroll("right")}
          className="absolute right-0 top-0 bottom-0 w-10 sm:w-12 bg-black/60 hover:bg-black/80 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-l border-white/5 cursor-pointer text-white"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transform hover:scale-[1.2] transition-transform" />
        </button>
      </div>
    </div>
  );
}
export default MovieRow;
