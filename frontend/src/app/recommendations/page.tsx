"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RecommendationRow } from "@/components/RecommendationRow";
import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/context/ProfileContext";
import {
  addToWatchlist,
  addWatchHistory,
  getProfileRecommendations,
} from "@/lib/api";
import type { RecommendationItem } from "@/types/recommendation";

export default function RecommendationsPage() {
  const { token } = useAuth();
  const { activeProfile } = useProfiles();

  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingContentId, setLoadingContentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadRecommendations() {
    if (!token || !activeProfile) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getProfileRecommendations(token, activeProfile.id, 12);
      setItems(data.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load recommendations."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!token || !activeProfile) {
      return;
    }

    const authToken = token;
    const profileId = activeProfile.id;

    let cancelled = false;

    async function fetchRecommendations() {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await getProfileRecommendations(
            authToken,
            profileId,
            12
          );

        if (!cancelled) {
          setItems(data.items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load recommendations."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchRecommendations();

    return () => {
      cancelled = true;
    };
  }, [token, activeProfile]);

  async function handleAddToWatchlist(contentId: number, title: string) {
    if (!token || !activeProfile) {
      setError("Choose a profile before adding to your watchlist.");
      return;
    }

    setLoadingContentId(contentId);
    setError(null);
    setSuccessMessage(null);

    try {
      await addToWatchlist(token, activeProfile.id, contentId);
      setSuccessMessage(`${title} was added to ${activeProfile.name}'s watchlist.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add to watchlist."
      );
    } finally {
      setLoadingContentId(null);
    }
  }

  async function handleStartWatching(contentId: number, title: string) {
    if (!token || !activeProfile) {
      setError("Choose a profile before tracking watch history.");
      return;
    }

    setLoadingContentId(contentId);
    setError(null);
    setSuccessMessage(null);

    try {
      await addWatchHistory(token, activeProfile.id, contentId, 60, false);
      setSuccessMessage(`${title} was added to Continue Watching.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update watch history."
      );
    } finally {
      setLoadingContentId(null);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
              CinePortal
            </p>

            <h1 className="text-4xl font-bold">Recommended for You</h1>

            <p className="mt-3 text-neutral-400">
              {activeProfile
                ? `Personalized recommendations for ${activeProfile.name}`
                : "Choose a profile to get personalized recommendations."}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/profiles"
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-900"
            >
              Profiles
            </Link>

            <Link
              href="/browse"
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-900"
            >
              Browse
            </Link>
          </div>
        </div>

        {isLoading && (
          <p className="mt-8 text-neutral-400">Loading recommendations...</p>
        )}

        {error && <p className="mt-8 text-red-500">{error}</p>}

        {successMessage && (
          <p className="mt-8 text-green-500">{successMessage}</p>
        )}

        {!activeProfile && (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <p className="text-neutral-300">
              You need to select a profile first.
            </p>

            <Link
              href="/profiles"
              className="mt-4 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
            >
              Choose Profile
            </Link>
          </div>
        )}

        {activeProfile && !isLoading && (
          <div className="mt-10">
            <RecommendationRow
              title="Recommended for You"
              items={items}
              emptyMessage="No recommendations yet. Watch or rate a few titles first."
              onAddToWatchlist={handleAddToWatchlist}
              onStartWatching={handleStartWatching}
              onRatingSaved={loadRecommendations}
              loadingContentId={loadingContentId}
            />
          </div>
        )}
      </section>
    </main>
  );
}