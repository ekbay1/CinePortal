import type { Content } from "@/types/content";

export type RecommendationItem = {
  content: Content;
  score: number;
  reason: string;
};

export type RecommendationResponse = {
  profile_id: number | null;
  items: RecommendationItem[];
};