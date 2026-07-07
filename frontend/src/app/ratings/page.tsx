"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RatingPanel } from "@/components/RatingPanel";
import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/context/ProfileContext";
import { listProfileRatings } from "@/lib/api";
import type { Rating } from "@/types/rating";

export default function RatingsPage() {
  const { token } = useAuth();
  const { activeProfile } = useProfiles();

  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRatings() {
    if (!token || !activeProfile) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await listProfileRatings(token, activeProfile.id);
      setRatings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ratings.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeProfile]);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
              CinePortal
            </p>

            <h1 className="text-4xl font-bold">My Ratings</h1>

            <p className="mt-3 text-neutral-400">
              {activeProfile
                ? `Ratings for ${activeProfile.name}`
                : "Choose a profile to view ratings."}
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
              href="/recommendations"
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-900"
            >
              Recommendations
            </Link>
          </div>
        </div>

        {!activeProfile && (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <p className="text-neutral-300">
              Select a profile before viewing ratings.
            </p>

            <Link
              href="/profiles"
              className="mt-4 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
            >
              Choose Profile
            </Link>
          </div>
        )}

        {isLoading && <p className="mt-8 text-neutral-400">Loading ratings...</p>}
        {error && <p className="mt-8 text-red-500">{error}</p>}

        {activeProfile && !isLoading && ratings.length === 0 && (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <p className="text-neutral-300">
              You have not rated anything yet.
            </p>

            <Link
              href="/browse"
              className="mt-4 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
            >
              Browse Content
            </Link>
          </div>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ratings.map((rating) => {
            if (!rating.content) {
              return null;
            }

            const content = rating.content;
            const genres = content.genres.map((genre) => genre.name).join(", ");

            return (
              <article
                key={rating.id}
                className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <Link href={`/content/${content.id}`}>
                  <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-neutral-900 text-neutral-500 hover:bg-neutral-800">
                    Poster
                  </div>
                </Link>

                <Link href={`/content/${content.id}`}>
                  <h2 className="text-lg font-semibold hover:underline">
                    {content.title}
                  </h2>
                </Link>

                <p className="mt-1 text-sm text-neutral-400">
                  {content.content_type} · {content.release_year ?? "Unknown"} ·{" "}
                  {content.maturity_rating ?? "Not rated"}
                </p>

                <p className="mt-3 text-sm text-neutral-400">
                  Genres: {genres || "None"}
                </p>

                <p className="mt-3 text-sm text-neutral-300">
                  Current rating: {rating.score}/5
                </p>

                <div className="mt-4">
                  <RatingPanel
                    contentId={content.id}
                    title={content.title}
                    initialScore={rating.score}
                    compact
                    onRatingSaved={loadRatings}
                  />
                </div>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}