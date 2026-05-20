import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { contentService } from "../services/content";
import { HeroBillboard } from "../features/recommendations/components/hero-billboard";
import { MovieRow } from "../features/recommendations/components/movie-row";
import { PageLoader } from "../components/loading/page-loader";
import { AlertCircle } from "lucide-react";

// Import your official project Movie type right here
import type { Movie } from "../types";

export function HomePage() {
  // Query 1: Fetch list of catalog movies using your official type
  const {
    data: movies = [],
    isLoading: moviesLoading,
    error: moviesError,
  } = useQuery<Movie[]>({
    queryKey: ["catalog-movies"],
    queryFn: () => contentService.getMovies(),
  });

  // Query 2: Fetch the featured spotlight film
  const {
    data: featuredMovie,
    isLoading: featuredLoading,
    error: featuredError,
  } = useQuery({
    queryKey: ["featured-movie"],
    queryFn: () => contentService.getFeaturedMovie(),
  });

  const isLoading = moviesLoading || featuredLoading;
  const hasError = moviesError || featuredError;

  // Memoize data transformations using the official type definitions
  const { trendingMovies, sciFiMovies, actionMovies, awardWinners } =
    useMemo(() => {
      if (!movies.length) {
        return {
          trendingMovies: [],
          sciFiMovies: [],
          actionMovies: [],
          awardWinners: [],
        };
      }

      return {
        trendingMovies: movies.slice(0, 4),
        sciFiMovies: movies.filter(
          (m) =>
            m.genres?.includes("Sci-Fi") || m.genres?.includes("Adventure"),
        ),
        actionMovies: movies.filter(
          (m) => m.genres?.includes("Action") || m.genres?.includes("Thriller"),
        ),
        awardWinners: movies.filter((m) => {
          const numericRating =
            typeof m.rating === "string" ? parseFloat(m.rating) : m.rating;
          // Using an optional chain check just in case matchPercentage isn't on all entries
          const matches =
            m.matchPercentage !== undefined ? m.matchPercentage : 0;
          return numericRating >= 8 || matches >= 95;
        }),
      };
    }, [movies]);

  if (isLoading) {
    return <PageLoader message="Fetching Portal cinema catalog..." />;
  }

  if (hasError || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-4 px-6">
        <AlertCircle className="w-12 h-12 text-netflix-red animate-pulse" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">
            Database Synchronization Failed
          </h2>
          <p className="text-cinema-gray text-xs max-w-sm leading-relaxed">
            We are experiencing backend connectivity delays. Verify NestJS
            server is running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#08080C] min-h-screen pb-20 select-none">
      {/* Immersive Spotlight Header Banner */}
      {featuredMovie && <HeroBillboard movie={featuredMovie} />}

      {/* Categorized horizontal sliders rows */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-30 space-y-6 sm:space-y-8 ${
          featuredMovie ? "mt-[-30px] sm:mt-[-50px]" : "mt-6"
        }`}
      >
        {trendingMovies.length > 0 && (
          <MovieRow title="Trending Now" movies={trendingMovies} />
        )}

        {awardWinners.length > 0 && (
          <MovieRow title="Award-Winning Masterpieces" movies={awardWinners} />
        )}

        {sciFiMovies.length > 0 && (
          <MovieRow title="Sci-Fi & Cyberpunk Specials" movies={sciFiMovies} />
        )}

        {actionMovies.length > 0 && (
          <MovieRow
            title="High-Octane Action & Thrillers"
            movies={actionMovies}
          />
        )}
      </div>
    </div>
  );
}

export default HomePage;
