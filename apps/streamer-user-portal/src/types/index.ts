export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionActive: boolean;
  subscriptionPlanId?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
}

export interface MovieArtwork {
  poster: string;    // Vertical poster (e.g. card grids)
  backdrop: string;  // Cinematic wide landscape (e.g. hero banner)
  logo?: string;     // Transparent title overlay graphic
  preview?: string;  // Loopable short preview clip URL
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // in seconds
  releaseYear: number;
  rating: string; // e.g., "PG-13", "18+"
  genres: string[];
  isTrending: boolean;
  isPopular: boolean;
  cast: string[];
  director: string;
  matchPercentage?: number; // e.g., 98
  qualityTags?: string[]; // e.g., ["Ultra HD", "5.1", "HDR"]
  artwork?: MovieArtwork;  // Dedicated artwork sub-system
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface PlaybackState {
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
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  isPopular: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
