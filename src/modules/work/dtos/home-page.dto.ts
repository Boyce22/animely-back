import { TagResponse } from '@/modules/work/dtos/work-response.dto';

export interface HeroWorkDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverUrl: string;
  bannerUrl?: string;
  type: string;
  contentRating?: string;
  tags: TagResponse[];
}

export interface WorkCardDto {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  type: string;
  publicationStatus: string;
  averageRating: number;
  bayesianScore: number;
  startYear?: number;
  contentRating?: string;
  tags: TagResponse[];
}

export interface CollectionDto {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  works: Array<{
    id: string;
    coverUrl: string;
  }>;
}

export interface HomePageDto {
  hero: HeroWorkDto[];
  specialForYou: WorkCardDto[];
  trending: WorkCardDto[];
  popular: {
    items: WorkCardDto[];
    total: number;
  };
  collections: CollectionDto[];
}
