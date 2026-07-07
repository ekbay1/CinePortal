import type { LoginInput, LoginResponse, SignupInput, User } from "@/types/auth";
import type { SearchResponse } from "@/types/content";
import type { HomepageResponse } from "@/types/content";
import type { Profile, ProfileCreateInput } from "@/types/profile";
import type { WatchHistoryItem, WatchlistItem } from "@/types/watch";
import type { RecommendationResponse } from "@/types/recommendation";
import type { Content } from "@/types/content";
import type { Rating, RatingCreateInput, RatingUpdateInput } from "@/types/rating";

export const API_BASE_URL =
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

export async function signupUser(input: SignupInput): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to sign up.");
  }

  return response.json();
}

export async function loginUser(input: LoginInput): Promise<LoginResponse> {
  const formData = new URLSearchParams();

  formData.set("username", input.email);
  formData.set("password", input.password);

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to log in.");
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load current user.");
  }

  return response.json();
}

export async function authFetch(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}

export async function listProfiles(token: string): Promise<Profile[]> {
  const response = await authFetch("/api/profiles/", token);

  if (!response.ok) {
    throw new Error("Failed to load profiles.");
  }

  return response.json();
}

export async function createProfile(
  token: string,
  input: ProfileCreateInput
): Promise<Profile> {
  const response = await authFetch("/api/profiles/", token, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      avatar_url: input.avatar_url ?? null,
      maturity_rating: input.maturity_rating ?? "PG-13",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to create profile.");
  }

  return response.json();
}

export async function deleteProfile(
  token: string,
  profileId: number
): Promise<void> {
  const response = await authFetch(`/api/profiles/${profileId}`, token, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete profile.");
  }
}

export async function getHomepageContent(): Promise<HomepageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/content/home`);

  if (!response.ok) {
    throw new Error("Failed to load homepage content.");
  }

  return response.json();
}

export async function addToWatchlist(
  token: string,
  profileId: number,
  contentId: number
): Promise<WatchlistItem> {
  const response = await authFetch("/api/watch/watchlist", token, {
    method: "POST",
    body: JSON.stringify({
      profile_id: profileId,
      content_id: contentId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to add to watchlist.");
  }

  return response.json();
}

export async function listWatchlist(
  token: string,
  profileId: number
): Promise<WatchlistItem[]> {
  const response = await authFetch(
    `/api/watch/profiles/${profileId}/watchlist`,
    token
  );

  if (!response.ok) {
    throw new Error("Failed to load watchlist.");
  }

  return response.json();
}

export async function removeFromWatchlist(
  token: string,
  profileId: number,
  contentId: number
): Promise<void> {
  const response = await authFetch(
    `/api/watch/profiles/${profileId}/watchlist/${contentId}`,
    token,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove from watchlist.");
  }
}

export async function addWatchHistory(
  token: string,
  profileId: number,
  contentId: number,
  progressSeconds = 60,
  completed = false
): Promise<WatchHistoryItem> {
  const response = await authFetch("/api/watch/history", token, {
    method: "POST",
    body: JSON.stringify({
      profile_id: profileId,
      content_id: contentId,
      progress_seconds: progressSeconds,
      completed,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update watch history.");
  }

  return response.json();
}

export async function listContinueWatching(
  token: string,
  profileId: number
): Promise<WatchHistoryItem[]> {
  const response = await authFetch(
    `/api/watch/profiles/${profileId}/continue-watching`,
    token
  );

  if (!response.ok) {
    throw new Error("Failed to load Continue Watching.");
  }

  return response.json();
}

export async function getProfileRecommendations(
  token: string,
  profileId: number,
  limit = 10
): Promise<RecommendationResponse> {
  const response = await authFetch(
    `/api/recommendations/profiles/${profileId}?limit=${limit}`,
    token
  );

  if (!response.ok) {
    throw new Error("Failed to load recommendations.");
  }

  return response.json();
}

export async function getSimilarTitles(
  contentId: number,
  limit = 10
): Promise<RecommendationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/recommendations/content/${contentId}/similar?limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Failed to load similar titles.");
  }

  return response.json();
}

export async function getBecauseYouWatched(
  token: string,
  profileId: number,
  contentId: number,
  limit = 10
): Promise<RecommendationResponse> {
  const response = await authFetch(
    `/api/recommendations/profiles/${profileId}/because-you-watched/${contentId}?limit=${limit}`,
    token
  );

  if (!response.ok) {
    throw new Error("Failed to load because-you-watched recommendations.");
  }

  return response.json();
}

export async function getContentById(contentId: number): Promise<Content> {
  const response = await fetch(`${API_BASE_URL}/api/content/${contentId}`);

  if (!response.ok) {
    throw new Error("Failed to load content.");
  }

  return response.json();
}

export async function createOrUpdateRating(
  token: string,
  input: RatingCreateInput
): Promise<Rating> {
  const response = await authFetch("/api/ratings/", token, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to save rating.");
  }

  return response.json();
}

export async function listProfileRatings(
  token: string,
  profileId: number
): Promise<Rating[]> {
  const response = await authFetch(`/api/ratings/profiles/${profileId}`, token);

  if (!response.ok) {
    throw new Error("Failed to load ratings.");
  }

  return response.json();
}

export async function updateProfileRating(
  token: string,
  profileId: number,
  contentId: number,
  input: RatingUpdateInput
): Promise<Rating> {
  const response = await authFetch(
    `/api/ratings/profiles/${profileId}/content/${contentId}`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to update rating.");
  }

  return response.json();
}

export async function deleteProfileRating(
  token: string,
  profileId: number,
  contentId: number
): Promise<void> {
  const response = await authFetch(
    `/api/ratings/profiles/${profileId}/content/${contentId}`,
    token,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete rating.");
  }
}