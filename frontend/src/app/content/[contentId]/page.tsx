"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { RecommendationRow } from "@/components/RecommendationRow";
import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/context/ProfileContext";
import {
  addToWatchlist,
  addWatchHistory,
  getBecauseYouWatched,
  getContentById,
  getSimilarTitles,
} from "@/lib/api";
import type { Content } from "@/types/content";
import type { RecommendationItem } from "@/types/recommendation";
import { RatingPanel } from "@/components/RatingPanel";

export default function ContentDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const { activeProfile } = useProfiles();

  const contentId = useMemo(() => {
    const rawContentId = params.contentId;

    if (Array.isArray(rawContentId)) {
      return Number(rawContentId[0]);
    }

    return Number(rawContentId);
  }, [params.contentId]);

  const [content, setContent] = useState<Content | null>(null);
  const [similarItems, setSimilarItems] = useState<RecommendationItem[]>([]);
  const [becauseItems, setBecauseItems] = useState<RecommendationItem[]>([]);
  const [loadingContentId, setLoadingContentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPageData() {
      if (!contentId || Number.isNaN(contentId)) {
        setError("Invalid content ID.");
        return;
      }

      setError(null);

      try {
        const [contentData, similarData] = await Promise.all([
          getContentById(contentId),
          getSimilarTitles(contentId, 8),
        ]);

        setContent(contentData);
        setSimilarItems(similarData.items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load content."
        );
      }
    }

    loadPageData();
  }, [contentId]);

  useEffect(() => {
    async function loadBecauseYouWatched() {
      if (!token || !activeProfile || !contentId || Number.isNaN(contentId)) {
        return;
      }

      try {
        const data = await getBecauseYouWatched(
          token,
          activeProfile.id,
          contentId,
          8
        );

        setBecauseItems(data.items);
      } catch {
        setBecauseItems([]);
      }
    }

    loadBecauseYouWatched();
  }, [token, activeProfile, contentId]);

  async function handleAddToWatchlist(targetContentId: number, title: string) {
    if (!token || !activeProfile) {
      setError("Choose a profile before adding to your watchlist.");
      return;
    }

    setLoadingContentId(targetContentId);
    setError(null);
    setSuccessMessage(null);

    try {
      await addToWatchlist(token, activeProfile.id, targetContentId);
      setSuccessMessage(`${title} was added to ${activeProfile.name}'s watchlist.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add to watchlist."
      );
    } finally {
      setLoadingContentId(null);
    }
  }

  async function handleStartWatching(targetContentId: number, title: string) {
    if (!token || !activeProfile) {
      setError("Choose a profile before tracking watch history.");
      return;
    }

    setLoadingContentId(targetContentId);
    setError(null);
    setSuccessMessage(null);

    try {
      await addWatchHistory(token, activeProfile.id, targetContentId, 60, false);
      setSuccessMessage(`${title} was added to Continue Watching.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update watch history."
      );
    } finally {
      setLoadingContentId(null);
    }
  }

  if (error && !content) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <section className="max-w-xl text-center">
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="mt-4 text-red-500">{error}</p>

          <Link
            href="/browse"
            className="mt-8 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
          >
            Back to Browse
          </Link>
        </section>
      </main>
    );
  }

  if (!content) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading content...
      </main>
    );
  }

  const genres = content.genres.map((genre) => genre.name).join(", ");

  const services = content.availability
    .map((availability) => availability.service.name)
    .join(", ");

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            href="/browse"
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
          >
            Back to Browse
          </Link>
        </div>

        <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="flex h-96 items-center justify-center rounded-xl bg-neutral-900 text-neutral-500">
            Poster
          </div>

          <div>
            <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
              {content.is_original ? "CinePortal Original" : "Streaming Title"}
            </p>

            <h1 className="text-5xl font-bold">{content.title}</h1>

            <p className="mt-4 text-neutral-400">
              {content.content_type} · {content.release_year ?? "Unknown"} ·{" "}
              {content.maturity_rating ?? "Not rated"} ·{" "}
              {content.runtime_minutes
                ? `${content.runtime_minutes} min`
                : "Runtime unknown"}
            </p>

            {content.description && (
              <p className="mt-6 max-w-3xl text-lg text-neutral-300">
                {content.description}
              </p>
            )}

            <p className="mt-6 text-neutral-400">
              <span className="text-neutral-200">Genres:</span>{" "}
              {genres || "None"}
            </p>

            <p className="mt-2 text-neutral-400">
              <span className="text-neutral-200">Available on:</span>{" "}
              {services || "Unknown"}
            </p>

            {error && <p className="mt-6 text-red-500">{error}</p>}

            {successMessage && (
              <p className="mt-6 text-green-500">{successMessage}</p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleStartWatching(content.id, content.title)}
                disabled={loadingContentId === content.id}
                className="rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
              >
                Start Watching
              </button>

              <button
                type="button"
                onClick={() => handleAddToWatchlist(content.id, content.title)}
                disabled={loadingContentId === content.id}
                className="rounded-lg border border-neutral-700 px-6 py-3 font-medium text-white hover:bg-neutral-900 disabled:opacity-50"
              >
                Add to Watchlist
              </button>
            </div>
            <div className="mt-8">
                <RatingPanel
                    contentId={content.id}
                    title={content.title}
                />
            </div>
          </div>
        </section>

        <section className="mt-14 space-y-12">
          {activeProfile && becauseItems.length > 0 && (
            <RecommendationRow
              title="Because You Watched"
              items={becauseItems}
              onAddToWatchlist={handleAddToWatchlist}
              onStartWatching={handleStartWatching}
              loadingContentId={loadingContentId}
            />
          )}

          <RecommendationRow
            title="Similar Titles"
            items={similarItems}
            emptyMessage="No similar titles found yet."
            onAddToWatchlist={handleAddToWatchlist}
            onStartWatching={handleStartWatching}
            loadingContentId={loadingContentId}
          />
        </section>
      </section>
    </main>
  );
}