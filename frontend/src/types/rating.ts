import type { Content } from "@/types/content";

export type Rating = {
  id: number;
  profile_id: number;
  content_id: number;
  score: number;
  created_at: string;
  content: Content | null;
};

export type RatingCreateInput = {
  profile_id: number;
  content_id: number;
  score: number;
};

export type RatingUpdateInput = {
  score: number;
};