import type { SearchResponse } from "@/types/content";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type SearchContentParams = {
  q?: string;
  genre?: string;
  service?: string;
  content_type?: string;
  maturity_rating?: string;
  max_runtime?: number;
  min_year?: number;
  max_year?: number;
  is_original?: boolean;
  limit?: number;
  offset?: number;
};

export async function searchContent(
  params: SearchContentParams
): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const response = await fetch(
    `${API_BASE_URL}/api/search?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to search content.");
  }

  return response.json();
}