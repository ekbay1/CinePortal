import Link from "next/link";

import type { Content } from "@/types/content";

type ContentCardProps = {
  content: Content;
  footer?: React.ReactNode;
};

export function ContentCard({ content, footer }: ContentCardProps) {
  const genres = content.genres.map((genre) => genre.name).join(", ");

  const services = content.availability
    .map((item) => item.service.name)
    .join(", ");

  const requiresAddon = content.availability.some(
    (item) => item.requires_addon
  );

  return (
    <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-600">
      <Link href={`/content/${content.id}`}>
        <div className="mb-3 flex h-44 items-center justify-center rounded-lg bg-neutral-900 text-neutral-500 hover:bg-neutral-800">
          Poster
        </div>
      </Link>

      <Link href={`/content/${content.id}`}>
        <h2 className="text-lg font-semibold hover:underline">
          {content.title}
        </h2>
      </Link>

      <p className="mt-1 text-sm text-neutral-400">
        {content.content_type} · {content.release_year ?? "Unknown year"} ·{" "}
        {content.maturity_rating ?? "Not rated"}
      </p>

      {content.runtime_minutes && (
        <p className="mt-1 text-sm text-neutral-500">
          {content.runtime_minutes} minutes
        </p>
      )}

      {content.description && (
        <p className="mt-3 line-clamp-3 text-sm text-neutral-300">
          {content.description}
        </p>
      )}

      <p className="mt-3 text-sm text-neutral-400">
        <span className="font-medium text-neutral-300">Genres:</span>{" "}
        {genres || "None"}
      </p>

      <p className="mt-1 text-sm text-neutral-400">
        <span className="font-medium text-neutral-300">Available on:</span>{" "}
        {services || "Unknown"}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {content.is_original && (
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs">
            StreamHub Original
          </span>
        )}

        {requiresAddon && (
          <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
            Add-on Required
          </span>
        )}
      </div>

      {footer && <div className="mt-4">{footer}</div>}
    </article>
  );
}