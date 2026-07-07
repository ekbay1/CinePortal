"use client";

import { useState } from "react";

import { StarRating } from "@/components/StarRating";
import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/context/ProfileContext";
import { createOrUpdateRating, deleteProfileRating } from "@/lib/api";

type RatingPanelProps = {
  contentId: number;
  title: string;
  initialScore?: number | null;
  compact?: boolean;
  onRatingSaved?: () => void;
};

export function RatingPanel({
  contentId,
  title,
  initialScore = null,
  compact = false,
  onRatingSaved,
}: RatingPanelProps) {
  const { token } = useAuth();
  const { activeProfile } = useProfiles();

  const [score, setScore] = useState(initialScore ?? 0);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveRating(nextScore: number) {
    if (!token || !activeProfile) {
      setError("Choose a profile before rating titles.");
      return;
    }

    setScore(nextScore);
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await createOrUpdateRating(token, {
        profile_id: activeProfile.id,
        content_id: contentId,
        score: nextScore,
      });

      setMessage(`Rated ${title} ${nextScore}/5.`);
      onRatingSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rating.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleNotInterested() {
    await saveRating(1);
  }

  async function handleLovedIt() {
    await saveRating(5);
  }

  async function handleDeleteRating() {
    if (!token || !activeProfile) {
      setError("Choose a profile before deleting ratings.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await deleteProfileRating(token, activeProfile.id, contentId);
      setScore(0);
      setMessage(`Removed rating for ${title}.`);
      onRatingSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete rating.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section
      className={
        compact
          ? "rounded-lg border border-neutral-800 bg-black p-3"
          : "rounded-xl border border-neutral-800 bg-neutral-950 p-5"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={compact ? "text-sm font-semibold" : "text-xl font-semibold"}>
            Rate this title
          </h3>

          <p className="mt-1 text-sm text-neutral-400">
            Your rating helps improve recommendations.
          </p>
        </div>

        <StarRating value={score} onChange={saveRating} disabled={isSaving} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleNotInterested}
          disabled={isSaving}
          className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-900 disabled:opacity-50"
        >
          Not Interested
        </button>

        <button
          type="button"
          onClick={handleLovedIt}
          disabled={isSaving}
          className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-900 disabled:opacity-50"
        >
          Loved It
        </button>

        {score > 0 && (
          <button
            type="button"
            onClick={handleDeleteRating}
            disabled={isSaving}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-900 disabled:opacity-50"
          >
            Remove Rating
          </button>
        )}
      </div>

      {message && <p className="mt-3 text-sm text-green-500">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </section>
  );
}