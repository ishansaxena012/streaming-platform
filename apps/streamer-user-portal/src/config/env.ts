export const env = {
  API_URL: (import.meta.env.VITE_API_URL as string) || "http://localhost:3000",
  CDN_URL: (import.meta.env.VITE_CDN_URL as string) || "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  ENV_MODE: (import.meta.env.MODE as string) || "development",
  FEATURE_FLAGS: {
    ENABLE_4K: true,
    ENABLE_PARENTAL_CONTROLS: true,
    ENABLE_WATCH_PARTY: false,
  },
  ANALYTICS_ENABLED: false,
};
