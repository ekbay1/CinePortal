import type { Content } from "@/types/content";

export type WatchlistItem = {
  id: number;
  profile_id: number;
  content_id: number;
  created_at: string;
  content: Content;
};

export type WatchHistoryItem = {
  id: number;
  profile_id: number;
  content_id: number;
  progress_seconds: number;
  completed: boolean;
  watched_at: string;
  content: Content;
};