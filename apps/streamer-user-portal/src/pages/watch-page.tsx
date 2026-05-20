import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contentService } from "../services/content";
import { CustomPlayer } from "../features/playback/components/custom-player";
import { PageLoader } from "../components/loading/page-loader";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { ROUTES } from "../config/routes";
import type { Movie } from "../types";

export function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Query 1: Fetch static video metadata
  const {
    data: movie,
    isLoading: metadataLoading,
    error: metadataError,
  } = useQuery<Movie>({
    queryKey: ["movie-detail", id],
    queryFn: () => contentService.getMovieById(id || ""),
    enabled: !!id,
  });

  // Query 2: Fetch stream URL in PARALLEL. (Doesn't need the whole movie object, just the ID)
  const {
    data: playbackUrl,
    isLoading: playbackLoading,
    error: playbackError,
  } = useQuery({
    queryKey: ["movie-playback", id],
    queryFn: () => contentService.getVideoPlaybackUrl(id || ""),
    enabled: !!id, // Trigger immediately alongside metadata
    staleTime: 0,
    gcTime: 0,
  });

  // Combine conditions accurately
  const isLoading = metadataLoading || playbackLoading;
  const hasError = metadataError || playbackError;

  // 1. Show loader while either network request is active
  if (isLoading) {
    return <PageLoader message="Allocating secure streaming channels..." />;
  }

  // 2. Show error block ONLY if an explicit network error occurs, or if loading finished and data is missing
  if (hasError || (!isLoading && (!movie || !playbackUrl))) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center gap-5 p-6">
        <AlertCircle className="w-12 h-12 text-netflix-red animate-pulse" />
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-white">
            Stream Allocation Failed
          </h3>
          <p className="text-xs text-cinema-gray max-w-xs mx-auto">
            The secure playback request was rejected by the gateway. Verify your
            subscription plan or local server status.
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="flex items-center gap-2 py-2.5 px-6 rounded-md bg-white hover:bg-white/90 text-black font-extrabold text-xs transition-colors shadow-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black">
      {/* Both variables are guaranteed defined here without runtime UI flashes */}
      <CustomPlayer videoId={movie.id} streamUrl={playbackUrl} />
    </div>
  );
}

export default WatchPage;
