import { create } from "zustand";
import { APP_CONSTANTS } from "../config/constants";

interface PlayerState {
  videoId: string | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  quality: string;
  isFullscreen: boolean;
  overlayVisible: boolean;
  subtitleLanguage: string | null;
  subtitleOpacity: number;

  setVideoId: (videoId: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: string) => void;
  setFullscreen: (isFullscreen: boolean) => void;
  setOverlayVisible: (visible: boolean) => void;
  setSubtitleLanguage: (lang: string | null) => void;
  setSubtitleOpacity: (opacity: number) => void;
  resetPlayback: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  videoId: null,
  playing: false,
  currentTime: 0,
  duration: 0,
  volume: APP_CONSTANTS.PLAYBACK.DEFAULT_VOLUME,
  muted: false,
  playbackRate: 1.0,
  quality: "Auto",
  isFullscreen: false,
  overlayVisible: true,
  subtitleLanguage: "English",
  subtitleOpacity: 0.8,

  setVideoId: (videoId) => set({ videoId }),
  setPlaying: (playing) => set({ playing }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, muted: volume === 0 }),
  setMuted: (muted) => set({ muted }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setQuality: (quality) => set({ quality }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setOverlayVisible: (overlayVisible) => set({ overlayVisible }),
  setSubtitleLanguage: (subtitleLanguage) => set({ subtitleLanguage }),
  setSubtitleOpacity: (subtitleOpacity) => set({ subtitleOpacity }),
  resetPlayback: () =>
    set({
      playing: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
      isFullscreen: false,
      overlayVisible: true,
    }),
}));
