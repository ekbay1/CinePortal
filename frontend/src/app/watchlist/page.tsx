"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/context/ProfileContext";
import { listWatchlist, removeFromWatchlist } from "@/lib/api";
import type { WatchlistItem } from "@/types/watch";

export default function WatchlistPage() {
  const { token } = useAuth();
  const { activeProfile } = useProfiles();

  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [removingContentId, setRemovingContentId] = useState<number | null>(null);

  useEffect(() => {
    async function loadWatchlist() {
      if (!token || !activeProfile) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await listWatchlist(token, activeProfile.id);
        setItems(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load watchlist."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadWatchlist();
  }, [token, activeProfile]);

  async function handleRemove(contentId: number) {
    if (!token || !activeProfile) {
      return;
    }

    setRemovingContentId(contentId);
    setError(null);

    try {
      await removeFromWatchlist(token, activeProfile.id, contentId);

      setItems((currentItems) =>
        currentItems.filter((item) => item.content_id !== contentId)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove item."
      );
    } finally {
      setRemovingContentId(null);
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

            <h1 className="text-4xl font-bold">My Watchlist</h1>

            <p className="mt-3 text-neutral-400">
              {activeProfile
                ? `Watchlist for ${activeProfile.name}`
                : "Choose a profile to view a watchlist."}
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

        {isLoading && <p className="mt-8 text-neutral-400">Loading watchlist...</p>}
        {error && <p className="mt-8 text-red-500">{error}</p>}

        {activeProfile && !isLoading && items.length === 0 && (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <p className="text-neutral-300">Your watchlist is empty.</p>

            <Link
              href="/browse"
              className="mt-4 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
            >
              Browse Content
            </Link>
          </div>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const content = item.content;
            const genres = content.genres.map((genre) => genre.name).join(", ");

            return (
              <article
                key={item.id}
                className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-neutral-900 text-neutral-500">
                  Poster
                </div>

                <h2 className="text-lg font-semibold">{content.title}</h2>

                <p className="mt-1 text-sm text-neutral-400">
                  {content.content_type} · {content.release_year ?? "Unknown"} ·{" "}
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

                <button
                  type="button"
                  onClick={() => handleRemove(content.id)}
                  disabled={removingContentId === content.id}
                  className="mt-4 rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-900 disabled:opacity-50"
                >
                  {removingContentId === content.id
                    ? "Removing..."
                    : "Remove"}
                </button>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}