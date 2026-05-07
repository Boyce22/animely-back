export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  type: string;
  color?: string;
}

export interface MangaDetailsResponse {
  chapterCount?: number;
  volumeCount?: number;
}

export interface AnimeDetailsResponse {
  episodeCount?: number;
  durationMinutes?: number;
  season?: string;
  seasonYear?: number;
}

export interface WorkResponse {
  id: string;
  title: string;
  nativeTitle?: string;
  englishTitle?: string;
  alternativeTitles?: string[];
  slug: string;
  description?: string;
  coverUrl: string;
  bannerUrl?: string;
  type: string;
  demographic?: string;
  contentRating?: string;
  visibilityStatus: string;
  publicationStatus: string;
  moderationStatus: string;
  startYear?: number;
  endYear?: number;
  averageRating: number;
  ratingCount: number;
  ratingDistribution?: Record<number, number>;
  bayesianScore: number;
  favoriteCount: number;
  commentCount: number;
  planToReadCount: number;
  readingCount: number;
  completedCount: number;
  onHoldCount: number;
  droppedCount: number;
  popularityScore: number;
  popularityRank?: number;
  scoreRank?: number;
  featuredWeight: number;
  mangaDetails?: MangaDetailsResponse;
  animeDetails?: AnimeDetailsResponse;
  tags: TagResponse[];
  createdAt: string;
  updatedAt: string;
}
