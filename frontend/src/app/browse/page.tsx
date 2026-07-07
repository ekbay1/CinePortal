"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/context/ProfileContext";
import {
  addToWatchlist,
  addWatchHistory,
  getHomepageContent,
} from "@/lib/api";
import type { HomepageRow } from "@/types/content";

export default function BrowsePage() {
  const { token } = useAuth();
  const { activeProfile } = useProfiles();

  const [rows, setRows] = useState<HomepageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingContentId, setLoadingContentId] = useState<number | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const data = await getHomepageContent();
        setRows(data.rows);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load content."
        );
      }
    }

    loadContent();
  }, []);

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
              StreamHub AI
            </p>

            <h1 className="text-4xl font-bold">Browse</h1>

            <p className="mt-3 text-neutral-400">
              {activeProfile
                ? `Browsing as ${activeProfile.name}`
                : "Choose a profile to save titles and track history."}
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
              href="/watchlist"
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-900"
            >
              Watchlist
            </Link>
          </div>
        </div>

        {error && <p className="mt-6 text-red-500">{error}</p>}
        {successMessage && <p className="mt-6 text-green-500">{successMessage}</p>}

        <section className="mt-10 space-y-10">
          {rows.map((row) => (
            <div key={row.title}>
              <h2 className="mb-4 text-2xl font-semibold">{row.title}</h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {row.items.map((content) => {
                  const genres = content.genres
                    .map((genre) => genre.name)
                    .join(", ");

                  const services = content.availability
                    .map((item) => item.service.name)
                    .join(", ");

                  return (
                    <article
                      key={`${row.title}-${content.id}`}
                      className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                    >
                      <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-neutral-900 text-neutral-500">
                        Poster
                      </div>

                      <h3 className="text-lg font-semibold">{content.title}</h3>

                      <p className="mt-1 text-sm text-neutral-400">
                        {content.content_type} ·{" "}
                        {content.release_year ?? "Unknown"} ·{" "}
                        {content.maturity_rating ?? "Not rated"}
                      </p>

                      {content.description && (
                        <p className="mt-3 line-clamp-3 text-sm text-neutral-300">
                          {content.description}
                        </p>
                      )}

                      <p className="mt-3 text-sm text-neutral-400">
                        Genres: {genres || "None"}
                      </p>

                      <p className="mt-1 text-sm text-neutral-400">
                        On: {services || "Unknown"}
                      </p>

                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddToWatchlist(content.id, content.title)
                          }
                          disabled={loadingContentId === content.id}
                          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
                        >
                          Add to Watchlist
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStartWatching(content.id, content.title)
                          }
                          disabled={loadingContentId === content.id}
                          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-900 disabled:opacity-50"
                        >
                          Start Watching
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}