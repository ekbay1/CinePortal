"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/context/ProfileContext";
import { listContinueWatching } from "@/lib/api";
import type { WatchHistoryItem } from "@/types/watch";

export default function ContinueWatchingPage() {
  const { token } = useAuth();
  const { activeProfile } = useProfiles();

  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadContinueWatching() {
      if (!token || !activeProfile) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await listContinueWatching(token, activeProfile.id);
        setItems(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load Continue Watching."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadContinueWatching();
  }, [token, activeProfile]);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
              CinePortal
            </p>

            <h1 className="text-4xl font-bold">Continue Watching</h1>

            <p className="mt-3 text-neutral-400">
              {activeProfile
                ? `Progress for ${activeProfile.name}`
                : "Choose a profile to view Continue Watching."}
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
          <p className="mt-8 text-neutral-400">Loading Continue Watching...</p>
        )}

        {error && <p className="mt-8 text-red-500">{error}</p>}

        {activeProfile && !isLoading && items.length === 0 && (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <p className="text-neutral-300">
              No titles in Continue Watching yet.
            </p>

            <Link
              href="/browse"
              className="mt-4 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
            >
              Start Watching
            </Link>
          </div>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const content = item.content;
            const minutesWatched = Math.floor(item.progress_seconds / 60);

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
                  {content.content_type} · {content.release_year ?? "Unknown"}
                </p>

                <p className="mt-3 text-sm text-neutral-300">
                  Watched about {minutesWatched} minute
                  {minutesWatched === 1 ? "" : "s"}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Completed: {item.completed ? "Yes" : "No"}
                </p>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}