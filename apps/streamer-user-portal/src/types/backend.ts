export interface BackendCategoryDto {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface BackendVideoDto {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  isPremium: boolean;
  hlsManifestUrl: string | null;
  status: "PENDING" | "PROCESSING" | "READY_FOR_REVIEW" | "PUBLISHED" | "REJECTED" | "FAILED" | "APPROVED";
  createdAt: string;
  updatedAt: string;
  uploadedById: string;
  approvedById: string | null;
  category?: BackendCategoryDto | null;
  // Optional aggregation metrics returned by trending and analytical routes
  views?: number;
}

export interface BackendHomeFeedDto {
  trending: BackendVideoDto[];
  latest: BackendVideoDto[];
  categories: (BackendCategoryDto & { videos: BackendVideoDto[] })[];
  continueWatching: {
    id: string;
    userId: string;
    videoId: string;
    progressSeconds: number;
    completed: boolean;
    lastWatchedAt: string;
    video: BackendVideoDto;
  }[];
}
