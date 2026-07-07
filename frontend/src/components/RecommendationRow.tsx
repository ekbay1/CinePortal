"use client";

import { RecommendationCard } from "@/components/RecommendationCard";
import type { RecommendationItem } from "@/types/recommendation";

type RecommendationRowProps = {
  title: string;
  items: RecommendationItem[];
  emptyMessage?: string;
  onAddToWatchlist?: (contentId: number, title: string) => void;
  onStartWatching?: (contentId: number, title: string) => void;
  loadingContentId?: number | null;
};

export function RecommendationRow({
  title,
  items,
  emptyMessage = "No recommendations yet.",
  onAddToWatchlist,
  onStartWatching,
  loadingContentId,
}: RecommendationRowProps) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">{title}</h2>

      {items.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-neutral-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <RecommendationCard
              key={item.content.id}
              item={item}
              onAddToWatchlist={onAddToWatchlist}
              onStartWatching={onStartWatching}
              isLoading={loadingContentId === item.content.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}