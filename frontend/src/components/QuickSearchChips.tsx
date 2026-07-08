"use client";

const quickSearches = [
  "sci-fi thriller",
  "family comedy",
  "action movie",
  "sports drama",
  "food documentary",
  "fantasy adventure",
  "short comedy",
  "StreamHub original",
];

type QuickSearchChipsProps = {
  onSelect: (query: string) => void;
};

export function QuickSearchChips({ onSelect }: QuickSearchChipsProps) {
  return (
    <section>
      <p className="mb-3 text-sm text-neutral-400">Quick searches</p>

      <div className="flex flex-wrap gap-2">
        {quickSearches.map((search) => (
          <button
            key={search}
            type="button"
            onClick={() => onSelect(search)}
            className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
          >
            {search}
          </button>
        ))}
      </div>
    </section>
  );
}