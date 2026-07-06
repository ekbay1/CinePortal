import type { Content } from "@/types/content";

type ContentCardProps = {
  content: Content;
};

export function ContentCard({ content }: ContentCardProps) {
  const genres = content.genres.map((genre) => genre.name).join(", ");
  const services = content.availability
    .map((item) => item.service.name)
    .join(", ");

  return (
    <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-neutral-900 text-neutral-500">
        Poster
      </div>

      <h2 className="text-lg font-semibold">{content.title}</h2>

      <p className="mt-1 text-sm text-neutral-400">
        {content.content_type} · {content.release_year ?? "Unknown year"} ·{" "}
        {content.maturity_rating ?? "Not rated"}
      </p>

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

      {content.is_original && (
        <p className="mt-3 inline-block rounded-full bg-neutral-800 px-3 py-1 text-xs">
          CinePortal Original
        </p>
      )}
    </article>
  );
}