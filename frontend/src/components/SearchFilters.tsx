"use client";

import type { Genre, StreamingService } from "@/types/content";

export type SearchFilterState = {
  genre: string;
  service: string;
  content_type: string;
  maturity_rating: string;
  max_runtime: string;
  min_year: string;
  max_year: string;
  is_original: string;
};

type SearchFiltersProps = {
  filters: SearchFilterState;
  genres: Genre[];
  services: StreamingService[];
  onChange: (filters: SearchFilterState) => void;
  onApply: () => void;
  onClear: () => void;
};

export function SearchFilters({
  filters,
  genres,
  services,
  onChange,
  onApply,
  onClear,
}: SearchFiltersProps) {
  function updateFilter(key: keyof SearchFilterState, value: string) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Filters</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Narrow results by genre, platform, type, rating, runtime, and year.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">Genre</span>
          <select
            value={filters.genre}
            onChange={(event) => updateFilter("genre", event.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-3 outline-none focus:border-white"
          >
            <option value="">Any genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.name}>
                {genre.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">Service</span>
          <select
            value={filters.service}
            onChange={(event) => updateFilter("service", event.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-3 outline-none focus:border-white"
          >
            <option value="">Any service</option>
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">Type</span>
          <select
            value={filters.content_type}
            onChange={(event) =>
              updateFilter("content_type", event.target.value)
            }
            className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-3 outline-none focus:border-white"
          >
            <option value="">Any type</option>
            <option value="movie">Movie</option>
            <option value="show">Show</option>
            <option value="documentary">Documentary</option>
            <option value="special">Special</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">
            Maturity Rating
          </span>
          <select
            value={filters.maturity_rating}
            onChange={(event) =>
              updateFilter("maturity_rating", event.target.value)
            }
            className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-3 outline-none focus:border-white"
          >
            <option value="">Any rating</option>
            <option value="G">G</option>
            <option value="PG">PG</option>
            <option value="PG-13">PG-13</option>
            <option value="R">R</option>
            <option value="TV-PG">TV-PG</option>
            <option value="TV-14">TV-14</option>
            <option value="TV-MA">TV-MA</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">
            Max Runtime
          </span>
          <select
            value={filters.max_runtime}
            onChange={(event) =>
              updateFilter("max_runtime", event.target.value)
            }
            className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-3 outline-none focus:border-white"
          >
            <option value="">Any runtime</option>
            <option value="30">30 minutes or less</option>
            <option value="60">1 hour or less</option>
            <option value="90">90 minutes or less</option>
            <option value="120">2 hours or less</option>
            <option value="150">2.5 hours or less</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">
            From Year
          </span>
          <input
            type="number"
            min={1900}
            max={2100}
            value={filters.min_year}
            onChange={(event) => updateFilter("min_year", event.target.value)}
            placeholder="2020"
            className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-3 outline-none focus:border-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">To Year</span>
          <input
            type="number"
            min={1900}
            max={2100}
            value={filters.max_year}
            onChange={(event) => updateFilter("max_year", event.target.value)}
            placeholder="2026"
            className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-3 outline-none focus:border-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">
            Originals
          </span>
          <select
            value={filters.is_original}
            onChange={(event) =>
              updateFilter("is_original", event.target.value)
            }
            className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-3 outline-none focus:border-white"
          >
            <option value="">All content</option>
            <option value="true">StreamHub Originals only</option>
            <option value="false">Non-originals only</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="mt-5 rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
      >
        Apply Filters
      </button>
    </section>
  );
}