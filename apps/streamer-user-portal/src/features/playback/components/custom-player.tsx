import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { usePlayerStore } from "../../../store/player.store";
import { PlayerLoader } from "../../../components/loading/player-loader";
import { PlayerErrorFallback } from "../../../components/errors/player-error-fallback";
import { PlaybackControls } from "./playback-controls";
import { contentService } from "../../../services/content";

interface CustomPlayerProps {
  streamUrl: string;
  videoId: string;
}

export function CustomPlayer({ streamUrl, videoId }: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [buffering, setBuffering] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const lastSyncedTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  
  const {
    playing,
    volume,
    muted,
    playbackRate,
    setVideoId,
    setPlaying,
    setCurrentTime,
    setDuration,
    resetPlayback,
  } = usePlayerStore();

  useEffect(() => {
    setVideoId(videoId);
    // Reset tracker references on video changes
    lastSyncedTimeRef.current = 0;
    currentTimeRef.current = 0;
    return () => {
      resetPlayback();
    };
  }, [videoId, setVideoId, resetPlayback]);

  // Heartbeat progress synchronizer method to secure playback positioning
  const syncProgress = (completed = false) => {
    const time = currentTimeRef.current;
    if (time === 0 && !completed) return;
    // Throttle: don't sync if positioning hasn't changed by at least 1s (except on complete)
    if (Math.abs(time - lastSyncedTimeRef.current) < 1 && !completed) return;

    contentService.syncWatchProgress(videoId, time, completed);
    lastSyncedTimeRef.current = time;
  };

  // Sync heartbeat exactly every 15 seconds of playing time to prevent server exhaustion
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (playing) {
      interval = setInterval(() => {
        syncProgress(false);
      }, 15000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [playing, videoId]);

  // Synchronize watch progress on component unmount (e.g. route transitions)
  useEffect(() => {
    return () => {
      const finalTime = currentTimeRef.current;
      if (finalTime > 0) {
        contentService.syncWatchProgress(videoId, finalTime, false);
      }
    };
  }, [videoId]);

  const loadStream = () => {
    const video = videoRef.current;
    if (!video) return;

    setBuffering(true);
    setErrorMsg(null);

    // Clean up pre-existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxMaxBufferLength: 10,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setBuffering(false);
        if (playing) {
          video.play().catch(() => setPlaying(false));
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMsg("Network transmission disrupted while fetching streaming chunks");
              hls.destroy();
              break;
            default:
              setErrorMsg("A fatal media decoding breakdown occurred");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Fallback for native Safari HLS
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setBuffering(false);
      });
      video.addEventListener("error", () => {
        setErrorMsg("Native HLS stream playback failed");
      });
    } else {
      setErrorMsg("Your browser is incompatible with HLS streaming files");
    }
  };

  useEffect(() => {
    loadStream();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  // Synchronize playing states
  useEffect(() => {
    const video = videoRef.current;
    if (!video || buffering) return;

    if (playing) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [playing, buffering]);

  // Synchronize playback speeds
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Synchronize sound settings
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = muted;
    }
  }, [volume, muted]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      currentTimeRef.current = video.currentTime;
    }
  };

  const handleDurationChange = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handleWaiting = () => setBuffering(true);
  const handlePlaying = () => setBuffering(false);

  // Sync progress immediately when player is paused or reaches the end
  const handlePause = () => {
    setPlaying(false);
    syncProgress(false);
  };

  const handleEnded = () => {
    setPlaying(false);
    syncProgress(true); // Completed!
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      
      {/* HTML5 standard media ref */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onPause={handlePause}
        onEnded={handleEnded}
        onClick={() => setPlaying(!playing)}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Buffering Indicator */}
      {buffering && !errorMsg && <PlayerLoader message="Synchronizing stream buffers..." />}

      {/* Decoder Error Panel */}
      {errorMsg && <PlayerErrorFallback onRetry={loadStream} errorMsg={errorMsg} />}

      {/* Exquisite Overlay Controls Layer */}
      <PlaybackControls videoRef={videoRef} />

    </div>
  );
}
export default CustomPlayer;
