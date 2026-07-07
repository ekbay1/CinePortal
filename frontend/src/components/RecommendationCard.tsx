"use client";

import Link from "next/link";

import type { RecommendationItem } from "@/types/recommendation";

type RecommendationCardProps = {
  item: RecommendationItem;
  onAddToWatchlist?: (contentId: number, title: string) => void;
  onStartWatching?: (contentId: number, title: string) => void;
  isLoading?: boolean;
};

export function RecommendationCard({
  item,
  onAddToWatchlist,
  onStartWatching,
  isLoading = false,
}: RecommendationCardProps) {
  const content = item.content;

  const genres = content.genres.map((genre) => genre.name).join(", ");

  const services = content.availability
    .map((availability) => availability.service.name)
    .join(", ");

  const scorePercent = Math.round(item.score * 100);

  return (
    <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <Link href={`/content/${content.id}`}>
        <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-neutral-900 text-neutral-500 hover:bg-neutral-800">
          Poster
        </div>
      </Link>

      <Link href={`/content/${content.id}`}>
        <h3 className="text-lg font-semibold hover:underline">
          {content.title}
        </h3>
      </Link>

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
        <span className="text-neutral-300">Reason:</span> {item.reason}
      </p>

      <p className="mt-1 text-sm text-neutral-500">
        Match score: {scorePercent}%
      </p>

      <p className="mt-3 text-sm text-neutral-400">
        Genres: {genres || "None"}
      </p>

      <p className="mt-1 text-sm text-neutral-400">
        On: {services || "Unknown"}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {onAddToWatchlist && (
          <button
            type="button"
            onClick={() => onAddToWatchlist(content.id, content.title)}
            disabled={isLoading}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            Add to Watchlist
          </button>
        )}

        {onStartWatching && (
          <button
            type="button"
            onClick={() => onStartWatching(content.id, content.title)}
            disabled={isLoading}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-900 disabled:opacity-50"
          >
            Start Watching
          </button>
        )}
      </div>
    </article>
  );
}