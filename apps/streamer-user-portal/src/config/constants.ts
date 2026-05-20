export const APP_CONSTANTS = {
  APP_NAME: "Portal OTT",
  MAX_PROFILES: 4,
  SEARCH_DEBOUNCE_MS: 300,
  MOCK_DELAY_MS: 600,
  DEFAULT_AVATARS: [
    { name: "Falcon", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80", color: "#E50914" },
    { name: "Phoenix", url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80", color: "#1E3A8A" },
    { name: "Siren", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80", color: "#065F46" },
    { name: "Titan", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80", color: "#EAB308" },
  ],
  PLAYBACK: {
    DEFAULT_VOLUME: 0.8,
    SEEK_STEP_SECONDS: 10,
    AUTO_HIDE_CONTROLS_MS: 3000,
    QUALITIES: ["Auto", "1080p", "720p", "480p"],
    RATES: [0.5, 0.75, 1, 1.25, 1.5, 2],
  },
} as const;
