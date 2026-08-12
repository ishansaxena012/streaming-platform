import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { contentService } from "../services/content";
import { HeroBillboard } from "../features/recommendations/components/hero-billboard";
import { MovieRow } from "../features/recommendations/components/movie-row";
import { PageLoader } from "../components/loading/page-loader";
import { AlertCircle } from "lucide-react";

import type { Movie } from "../types";

export function HomePage() {
  const {
    data: movies = [],
    isLoading: moviesLoading,
    error: moviesError,
  } = useQuery<Movie[]>({
    queryKey: ["catalog-movies"],
    queryFn: () => contentService.getMovies(),
  });

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
          const matches =
            m.matchPercentage !== undefined ? m.matchPercentage : 0;
          return numericRating >= 8 || matches >= 95;
        }),
      };
    }, [movies]);

  if (isLoading) {
    return <PageLoader message="Loading your catalog..." />;
  }

  if (hasError || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-4 px-6">
        <AlertCircle className="w-12 h-12 text-netflix-red animate-pulse" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">
            Couldn't load your catalog
          </h2>
          <p className="text-cinema-gray text-xs max-w-sm leading-relaxed">
            Something went wrong on our end. Try refreshing the page in a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#08080C] min-h-screen pb-20 select-none">
      {featuredMovie && <HeroBillboard movie={featuredMovie} />}

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
