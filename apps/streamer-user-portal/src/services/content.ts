import { apiClient } from "./api-client";
import type { Movie } from "../types";
import type { BackendVideoDto } from "../types/backend";

// Strict Translation Map: Translates Backend Video records to robust front-end Movie structures safely
export function mapVideoToMovie(video: BackendVideoDto): Movie {
  const releaseYear = video.createdAt ? new Date(video.createdAt).getFullYear() : 2026;
  const verticalArtwork = video.thumbnailUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba";
  const backdropArtwork = video.thumbnailUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1";

  return {
    id: video.id,
    title: video.title,
    description: video.description || "Cinematic streaming experience, engineered with next-generation HLS workflows.",
    thumbnailUrl: verticalArtwork,
    videoUrl: video.hlsManifestUrl || video.videoUrl || "",
    duration: video.duration || 134, // in seconds or default 2h14m fallback
    releaseYear,
    rating: video.isPremium ? "18+" : "PG-13",
    genres: video.category ? [video.category.name] : ["General"],
    isTrending: video.isPremium || (video.views !== undefined && video.views > 10),
    isPopular: video.isPremium,
    cast: ["Ott Lead Actor", "Monorepo Guest"],
    director: "Cinematic Director",
    matchPercentage: video.isPremium ? 98 : 86,
    qualityTags: video.isPremium ? ["Ultra HD", "5.1", "HDR"] : ["HD", "Stereo"],
    artwork: {
      poster: verticalArtwork,
      backdrop: backdropArtwork,
      preview: video.videoUrl || undefined,
    },
  };
}

// Paginated Response Interface matching backend wrappers
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const contentService = {
  // Fetch live video catalog from backend
  getMovies: async (): Promise<Movie[]> => {
    try {
      const response = await apiClient.get<PaginatedResponse<BackendVideoDto>>("/videos?limit=50");
      // Axios response interceptor auto-unpacks response.data, so response is the paginated object itself
      const data = response as unknown as PaginatedResponse<BackendVideoDto>;
      return (data.items || []).map(mapVideoToMovie);
    } catch (error) {
      console.error("Failed to fetch live catalog movies:", error);
      return [];
    }
  },

  // Fetch single video metadata from backend
  getMovieById: async (id: string): Promise<Movie | null> => {
    try {
      const response = await apiClient.get<BackendVideoDto>(`/videos/${id}`);
      const video = response as unknown as BackendVideoDto;
      return video ? mapVideoToMovie(video) : null;
    } catch (error) {
      console.error(`Failed to fetch movie metadata for ID ${id}:`, error);
      return null;
    }
  },

  // Fetch secure, signed playbacks and HLS manifest URLs
  getVideoPlaybackUrl: async (id: string): Promise<string> => {
    try {
      const response = await apiClient.get<{ playbackUrl: string }>(`/videos/${id}/playback`);
      const data = response as unknown as { playbackUrl: string };
      return data.playbackUrl;
    } catch (error) {
      console.error(`Failed to fetch secure playback signed URL for movie ${id}:`, error);
      throw error;
    }
  },

  // Synchronize watch progress heartbeat data to backend
  syncWatchProgress: async (id: string, progressSeconds: number, completed = false): Promise<void> => {
    try {
      await apiClient.patch(`/videos/${id}/progress`, {
        progressSeconds: Math.floor(progressSeconds),
        completed,
      });
    } catch (error) {
      console.error(`Failed to synchronize watch progress heartbeat for video ${id}:`, error);
    }
  },

  // Fetch the featured video spotlight from the trending feed or catalog
  getFeaturedMovie: async (): Promise<Movie | null> => {
    try {
      // Fetch trending videos and choose the highest-performing spot
      const response = await apiClient.get<PaginatedResponse<BackendVideoDto>>("/videos/trending?limit=1");
      const data = response as unknown as PaginatedResponse<BackendVideoDto>;
      if (data.items && data.items.length > 0) {
        return mapVideoToMovie(data.items[0]);
      }
      // Fallback: fetch first general movie
      const allMovies = await contentService.getMovies();
      return allMovies.length > 0 ? allMovies[0] : null;
    } catch (error) {
      console.error("Failed to fetch featured cinematic movie:", error);
      return null;
    }
  },

  // Fetch trending movies
  getTrendingMovies: async (): Promise<Movie[]> => {
    try {
      const response = await apiClient.get<PaginatedResponse<BackendVideoDto>>("/videos/trending?limit=10");
      const data = response as unknown as PaginatedResponse<BackendVideoDto>;
      return (data.items || []).map(mapVideoToMovie);
    } catch (error) {
      console.error("Failed to fetch trending movies:", error);
      return [];
    }
  },

  // Fetch popular movies
  getPopularMovies: async (): Promise<Movie[]> => {
    try {
      const response = await apiClient.get<PaginatedResponse<BackendVideoDto>>("/videos?sortBy=popular&limit=10");
      const data = response as unknown as PaginatedResponse<BackendVideoDto>;
      return (data.items || []).map(mapVideoToMovie);
    } catch (error) {
      console.error("Failed to fetch popular movies:", error);
      return [];
    }
  },

  // Fetch movies belonging to a category slug
  getMoviesByGenre: async (genreSlug: string): Promise<Movie[]> => {
    try {
      const response = await apiClient.get<PaginatedResponse<BackendVideoDto>>(`/videos/category/${genreSlug.toLowerCase()}`);
      const data = response as unknown as PaginatedResponse<BackendVideoDto>;
      return (data.items || []).map(mapVideoToMovie);
    } catch (error) {
      console.error(`Failed to fetch movies in category ${genreSlug}:`, error);
      return [];
    }
  },

  // Fetch movies matching input keyword with AbortController cancellation support
  searchMovies: async (query: string, signal?: AbortSignal): Promise<Movie[]> => {
    if (!query.trim()) return [];
    try {
      const response = await apiClient.get<PaginatedResponse<BackendVideoDto>>(
        `/videos/search?q=${encodeURIComponent(query)}&limit=20`,
        { signal }
      );
      const data = response as unknown as PaginatedResponse<BackendVideoDto>;
      return (data.items || []).map(mapVideoToMovie);
    } catch (error: any) {
      // Ignore normal abort errors thrown when Axios cancels the request
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        return [];
      }
      console.error(`Failed to search movies for "${query}":`, error);
      return [];
    }
  },
};
