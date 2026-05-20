import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import type { Movie } from "../../../types";
import { ROUTES } from "../../../config/routes";
import { motion } from "framer-motion";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="bg-[#121217] rounded-lg overflow-hidden border border-white/5 shadow-xl relative group select-none flex flex-col h-full cursor-pointer"
    >
      {/* Dynamic cover thumbnail frame */}
      <Link
        to={ROUTES.WATCH(movie.id)}
        className="aspect-[16/9] w-full overflow-hidden block relative border-b border-white/5 bg-black"
      >
        <img
          src={movie.thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
          loading="lazy"
        />
        {/* Transparent dark hover trigger */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
          <div className="p-3.5 rounded-full bg-white text-black shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-current" />
          </div>
        </div>
      </Link>
      
      {/* Card context panels */}
      <div className="p-4 flex-grow flex flex-col justify-between gap-3">
        <div className="space-y-1">
          <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-netflix-red transition-colors truncate">
            {movie.title}
          </h4>
          <p className="text-[9px] text-cinema-gray font-semibold tracking-wider uppercase truncate">
            {movie.genres.join(" • ")}
          </p>
        </div>
        
        {/* Sub-items details metrics */}
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2">
            {movie.matchPercentage && (
              <span className="text-green-500 font-extrabold text-[9px] sm:text-[10px]">
                {movie.matchPercentage}% Match
              </span>
            )}
            <span className="border border-white/15 text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-black text-cinema-gray bg-white/5 select-none uppercase">
              {movie.rating}
            </span>
          </div>
          <span className="text-cinema-gray font-bold text-[9px] sm:text-[10px]">{movie.releaseYear}</span>
        </div>
      </div>
    </motion.div>
  );
}
export default MovieCard;
