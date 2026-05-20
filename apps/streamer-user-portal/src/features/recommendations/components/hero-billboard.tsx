import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Info, Volume2, VolumeX, X } from "lucide-react";
import type { Movie } from "../../../types";
import { ROUTES } from "../../../config/routes";
import { motion, AnimatePresence } from "framer-motion";

interface HeroBillboardProps {
  movie: Movie;
}

export function HeroBillboard({ movie }: HeroBillboardProps) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  const handlePlay = () => {
    navigate(ROUTES.WATCH(movie.id));
  };

  return (
    <div className="relative w-full h-[65vh] sm:h-[85vh] bg-black overflow-hidden select-none">
      
      {/* Background Cover Art with bottom shadow fade */}
      <div className="absolute inset-0">
        <img
          src={movie.thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover scale-102 filter brightness-[0.7] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080C] via-[#08080C]/40 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080C]/80 via-transparent to-transparent" />
      </div>

      {/* Billboards Contents */}
      <div className="absolute bottom-[10%] sm:bottom-[15%] left-4 sm:left-12 md:left-16 max-w-xl space-y-4 z-20 px-2 sm:px-0">
        
        {/* Quality indicator tags */}
        <div className="flex gap-2 items-center">
          <span className="bg-netflix-red text-white text-[9px] font-black tracking-wider py-0.5 px-2 rounded uppercase shadow-md select-none">
            Spotlight
          </span>
          <div className="flex gap-1.5 items-center">
            {movie.qualityTags?.map((tag) => (
              <span key={tag} className="border border-white/25 text-white/80 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/40">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Title Slide in */}
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight uppercase"
        >
          {movie.title}
        </motion.h1>

        {/* Synopsis Summary */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium line-clamp-3 md:line-clamp-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        >
          {movie.description}
        </motion.p>

        {/* Actions Button Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2"
        >
          {/* Play */}
          <button
            onClick={handlePlay}
            className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-6 sm:px-8 rounded-md bg-white hover:bg-white/90 text-black font-extrabold text-xs sm:text-sm transition-all shadow-xl active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            Play Trailer
          </button>

          {/* More Info */}
          <button
            onClick={() => setInfoOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-5 sm:px-6 rounded-md bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl active:scale-95 border border-white/10 cursor-pointer uppercase tracking-wider backdrop-blur-sm"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            More Info
          </button>
        </motion.div>

      </div>

      {/* Floating Mute Trigger */}
      <div className="absolute bottom-[10%] sm:bottom-[15%] right-6 sm:right-16 z-20 hidden sm:flex items-center gap-3">
        <button
          onClick={() => setMuted(!muted)}
          className="p-2.5 rounded-full border border-white/25 hover:border-white text-white bg-black/40 hover:bg-black/60 transition-all cursor-pointer shadow-lg backdrop-blur-sm"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <span className="border-l-4 border-white/40 pl-3 py-1 font-semibold text-[10px] text-white/60 tracking-wider select-none uppercase">
          {movie.rating}
        </span>
      </div>

      {/* More Info Popups Drawer Modal */}
      <AnimatePresence>
        {infoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="max-w-xl w-full glass-panel-heavy rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            >
              {/* Header Image cover */}
              <div className="relative aspect-[16/9] w-full bg-black">
                <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121217] to-black/20" />
                
                <button
                  onClick={() => setInfoOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white hover:scale-105 transition-all cursor-pointer shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="absolute bottom-4 left-6 space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">{movie.title}</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-green-500 font-bold text-xs">{movie.matchPercentage}% Match</span>
                    <span className="text-white/60 text-xs font-semibold">{movie.releaseYear}</span>
                    <span className="border border-white/20 text-[9px] px-1.5 rounded font-black text-white/80 bg-white/5 uppercase">{movie.rating}</span>
                  </div>
                </div>
              </div>

              {/* Specs body list */}
              <div className="p-6 space-y-4 text-xs sm:text-sm">
                <p className="text-white/90 leading-relaxed font-semibold">{movie.description}</p>
                
                <div className="h-px bg-white/5 my-4" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p className="text-cinema-gray">
                      <span className="font-bold text-white/55 mr-1.5">Director:</span>
                      <span className="text-white/90 font-bold">{movie.director}</span>
                    </p>
                    <p className="text-cinema-gray">
                      <span className="font-bold text-white/55 mr-1.5">Genres:</span>
                      <span className="text-white/90 font-bold">{movie.genres.join(", ")}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-cinema-gray">
                      <span className="font-bold text-white/55 mr-1.5">Starring Cast:</span>
                      <span className="text-white/90 font-bold">{movie.cast.join(", ")}</span>
                    </p>
                    <p className="text-cinema-gray flex items-center gap-1.5">
                      <span className="font-bold text-white/55">Quality Specs:</span>
                      <span className="text-green-500 font-black">Ultra HD 4K Enabled</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handlePlay}
                    className="flex items-center gap-2 py-2 px-5 rounded bg-netflix-red hover:bg-red-700 text-white font-bold text-xs transition-all shadow-lg cursor-pointer uppercase tracking-wider"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Playing
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
export default HeroBillboard;
