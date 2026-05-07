export interface RatingResponse {
  id: string;
  score: number;
  review?: string;
  workId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
