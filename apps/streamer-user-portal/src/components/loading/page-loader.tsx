import { motion } from "framer-motion";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Allocating portal resources..." }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#08080C] z-50 select-none">
      <motion.div
        initial={{ opacity: 0.3, scale: 0.9 }}
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [0.9, 1.02, 0.9],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center gap-4"
      >
        <span className="text-4xl font-black tracking-widest bg-gradient-to-r from-netflix-red to-red-800 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(229,9,20,0.4)]">
          PORTAL
        </span>
        
        {/* Neon buffer bar */}
        <div className="w-20 h-1 rounded bg-netflix-red shadow-[0_0_10px_#E50914]" />
        
        {message && (
          <p className="text-[9px] text-cinema-gray font-bold tracking-widest uppercase mt-1 animate-pulse">
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
}
export default PageLoader;
