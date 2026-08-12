import { useState, useEffect } from "react";
import type { RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../../../store/player.store";
import { formatDuration } from "../../../lib/format";
import { APP_CONSTANTS } from "../../../config/constants";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ArrowLeft,
  Languages,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlaybackControlsProps {
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function PlaybackControls({ videoRef }: PlaybackControlsProps) {
  const navigate = useNavigate();
  
  const {
    playing,
    currentTime,
    duration,
    volume,
    muted,
    playbackRate,
    isFullscreen,
    overlayVisible,
    subtitleLanguage,
    setPlaying,
    setVolume,
    setMuted,
    setPlaybackRate,
    setFullscreen,
    setOverlayVisible,
  } = usePlayerStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    
    const handleUserInteraction = () => {
      setOverlayVisible(true);
      document.body.style.cursor = "default";
      
      clearTimeout(idleTimer);
      
      if (playing && !settingsOpen) {
        idleTimer = setTimeout(() => {
          setOverlayVisible(false);
          document.body.style.cursor = "none";
        }, APP_CONSTANTS.PLAYBACK.AUTO_HIDE_CONTROLS_MS);
      }
    };

    window.addEventListener("mousemove", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    
    handleUserInteraction();

    return () => {
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      clearTimeout(idleTimer);
      document.body.style.cursor = "default";
    };
  }, [playing, settingsOpen, setOverlayVisible]);

  const handlePlayToggle = () => {
    setPlaying(!playing);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (video) {
      const seekTime = parseFloat(e.target.value);
      video.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
    }
  };

  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  const handleFullscreenToggle = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [setFullscreen]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {overlayVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/70 flex flex-col justify-between p-4 sm:p-6 z-30 select-none text-white"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/75 hover:scale-105 active:scale-95 border border-white/5 transition-all cursor-pointer text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow flex items-center justify-center gap-8 text-white/95">
            <button
              onClick={() => handleSkip(-APP_CONSTANTS.PLAYBACK.SEEK_STEP_SECONDS)}
              className="p-3 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            >
              <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            
            <button
              onClick={handlePlayToggle}
              className="p-5 rounded-full bg-white text-black hover:scale-110 active:scale-95 shadow-xl transition-all cursor-pointer"
            >
              {playing ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            
            <button
              onClick={() => handleSkip(APP_CONSTANTS.PLAYBACK.SEEK_STEP_SECONDS)}
              className="p-3 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            >
              <RotateCw className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-cinema-gray font-semibold">
                <span>{formatDuration(currentTime)}</span>
                <span>-{formatDuration(Math.max(0, duration - currentTime))}</span>
              </div>

              <div className="relative group/timeline w-full flex items-center">
                <div className="absolute inset-y-0 left-0 right-0 h-1.5 bg-white/25 rounded overflow-hidden pointer-events-none">
                  <div
                    className="h-full bg-netflix-red shadow-[0_0_8px_#E50914] rounded-r"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-4 opacity-0 group-hover/timeline:opacity-100 cursor-pointer z-10 accent-netflix-red transition-opacity duration-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 sm:gap-6 relative">
                <button
                  onClick={handlePlayToggle}
                  className="text-white hover:text-netflix-red transition-all transform hover:scale-110 cursor-pointer p-1"
                >
                  {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current animate-pulse" />}
                </button>

                <div
                  className="flex items-center gap-2"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <button
                    onClick={handleMuteToggle}
                    className="text-white hover:text-netflix-red transition-all cursor-pointer p-1"
                  >
                    {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  
                  <motion.div
                    animate={{ width: showVolumeSlider ? 80 : 0, opacity: showVolumeSlider ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden flex items-center"
                  >
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 accent-netflix-red bg-white/20 rounded cursor-pointer focus:outline-none"
                    />
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="text-cinema-gray hover:text-white transition-all cursor-pointer p-1 flex items-center gap-1 text-xs font-bold"
                  >
                    <Settings className="w-5 h-5 animate-spin-slow" />
                    <span className="hidden sm:inline">{playbackRate}x</span>
                  </button>

                  <AnimatePresence>
                    {settingsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-10 right-0 w-44 glass-panel-heavy p-2 rounded-xl border border-white/10 z-50 text-xs overflow-hidden"
                      >
                        <p className="font-bold text-white px-2 py-1 mb-1 text-[10px] uppercase tracking-wider text-cinema-gray">
                          Speed Control
                        </p>
                        {APP_CONSTANTS.PLAYBACK.RATES.map((rate) => (
                          <button
                            key={rate}
                            onClick={() => {
                              setPlaybackRate(rate);
                              setSettingsOpen(false);
                            }}
                            className={`w-full text-left py-1.5 px-3.5 rounded-md hover:bg-white/5 transition-colors font-medium cursor-pointer ${
                              playbackRate === rate ? "text-netflix-red font-bold" : "text-white/80"
                            }`}
                          >
                            {rate === 1.0 ? "Normal (1.0x)" : `${rate}x`}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative group">
                  <button className="text-cinema-gray hover:text-white transition-all cursor-pointer p-1 flex items-center gap-1 text-xs font-bold">
                    <Languages className="w-5 h-5" />
                    <span className="hidden sm:inline">{subtitleLanguage || "Off"}</span>
                  </button>
                </div>

                <button
                  onClick={handleFullscreenToggle}
                  className="text-cinema-gray hover:text-white transition-all transform hover:scale-[1.15] cursor-pointer p-1"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default PlaybackControls;
