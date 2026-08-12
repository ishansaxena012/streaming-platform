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
    lastSyncedTimeRef.current = 0;
    currentTimeRef.current = 0;
    return () => {
      resetPlayback();
    };
  }, [videoId, setVideoId, resetPlayback]);

  const syncProgress = (completed = false) => {
    const time = currentTimeRef.current;
    if (time === 0 && !completed) return;
    // Throttle: don't sync if positioning hasn't changed by at least 1s (except on complete)
    if (Math.abs(time - lastSyncedTimeRef.current) < 1 && !completed) return;

    contentService.syncWatchProgress(videoId, time, completed);
    lastSyncedTimeRef.current = time;
  };

  // 15s cadence keeps progress roughly in sync without hammering the API
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
              setErrorMsg("Lost connection while streaming");
              hls.destroy();
              break;
            default:
              setErrorMsg("This video couldn't be played");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari plays HLS natively, without hls.js
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setBuffering(false);
      });
      video.addEventListener("error", () => {
        setErrorMsg("This video couldn't be played");
      });
    } else {
      setErrorMsg("Your browser doesn't support video streaming");
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || buffering) return;

    if (playing) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [playing, buffering]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackRate;
    }
  }, [playbackRate]);

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

  const handlePause = () => {
    setPlaying(false);
    syncProgress(false);
  };

  const handleEnded = () => {
    setPlaying(false);
    syncProgress(true);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
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

      {buffering && !errorMsg && <PlayerLoader message="Buffering..." />}

      {errorMsg && <PlayerErrorFallback onRetry={loadStream} errorMsg={errorMsg} />}

      <PlaybackControls videoRef={videoRef} />
    </div>
  );
}
export default CustomPlayer;
