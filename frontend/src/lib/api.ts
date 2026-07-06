import type { LoginInput, LoginResponse, SignupInput, User } from "@/types/auth";
import type { SearchResponse } from "@/types/content";

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