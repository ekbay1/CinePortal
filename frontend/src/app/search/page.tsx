"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { ContentCard } from "@/components/ContentCard";
import { QuickSearchChips } from "@/components/QuickSearchChips";
import {
  SearchFilters,
  type SearchFilterState,
} from "@/components/SearchFilters";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import {
  listGenres,
  listStreamingServices,
  searchContent,
  type SearchContentParams,
} from "@/lib/api";
import type { Content, Genre, StreamingService } from "@/types/content";

const defaultFilters: SearchFilterState = {
  genre: "",
  service: "",
  content_type: "",
  maturity_rating: "",
  max_runtime: "",
  min_year: "",
  max_year: "",
  is_original: "",
};

function toNumberOrUndefined(value: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
}

function toBooleanOrUndefined(value: string): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilterState>(defaultFilters);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [services, setServices] = useState<StreamingService[]>([]);

  const [results, setResults] = useState<Content[]>([]);
  const [total, setTotal] = useState<number | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];

    if (filters.genre) labels.push(`Genre: ${filters.genre}`);
    if (filters.service) labels.push(`Service: ${filters.service}`);
    if (filters.content_type) labels.push(`Type: ${filters.content_type}`);
    if (filters.maturity_rating)
      labels.push(`Rating: ${filters.maturity_rating}`);
    if (filters.max_runtime)
      labels.push(`Max runtime: ${filters.max_runtime} min`);
    if (filters.min_year) labels.push(`From: ${filters.min_year}`);
    if (filters.max_year) labels.push(`To: ${filters.max_year}`);
    if (filters.is_original === "true") labels.push("StreamHub Originals");
    if (filters.is_original === "false") labels.push("Non-originals");

    return labels;
  }, [filters]);

  useEffect(() => {
    async function loadFilterOptions() {
      setIsLoadingFilters(true);

      try {
        const [genreData, serviceData] = await Promise.all([
          listGenres(),
          listStreamingServices(),
        ]);

        setGenres(genreData);
        setServices(serviceData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load search filters."
        );
      } finally {
        setIsLoadingFilters(false);
      }
    }

    loadFilterOptions();
  }, []);

  function buildSearchParams(searchQuery: string): SearchContentParams {
    return {
      q: searchQuery.trim() || undefined,
      genre: filters.genre || undefined,
      service: filters.service || undefined,
      content_type: filters.content_type || undefined,
      maturity_rating: filters.maturity_rating || undefined,
      max_runtime: toNumberOrUndefined(filters.max_runtime),
      min_year: toNumberOrUndefined(filters.min_year),
      max_year: toNumberOrUndefined(filters.max_year),
      is_original: toBooleanOrUndefined(filters.is_original),
      limit: 30,
    };
  }

  async function runSearch(searchQuery = query) {
    const params = buildSearchParams(searchQuery);

    const hasAnySearchInput = Object.entries(params).some(([key, value]) => {
      return key !== "limit" && value !== undefined && value !== null && value !== "";
    });

    if (!hasAnySearchInput) {
      setResults([]);
      setTotal(null);
      setError("Enter a search term or choose at least one filter.");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const data = await searchContent(params);

      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong searching."
      );
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch(query);
  }

  async function handleTranscript(transcript: string) {
    setQuery(transcript);
    await runSearch(transcript);
  }

  async function handleQuickSearch(searchQuery: string) {
    setQuery(searchQuery);
    await runSearch(searchQuery);
  }

  function clearFilters() {
    setFilters(defaultFilters);
    setResults([]);
    setTotal(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
            StreamHub AI
          </p>

          <h1 className="text-4xl font-bold">Discover movies and shows</h1>

          <p className="mt-3 max-w-2xl text-neutral-400">
            Search by title, genre, description, platform, rating, runtime,
            release year, or use your voice to find something to watch.
          </p>
        </div>

        <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try: sci-fi thriller, family comedy, action movie..."
              className="flex-1 rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-white"
            />

            <button
              type="submit"
              className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
            >
              Search
            </button>
          </form>

          <div className="mt-4">
            <VoiceSearchButton onTranscript={handleTranscript} />
          </div>

          <div className="mt-6">
            <QuickSearchChips onSelect={handleQuickSearch} />
          </div>
        </section>

        <div className="mt-6">
          {isLoadingFilters ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-neutral-400">
              Loading filters...
            </div>
          ) : (
            <SearchFilters
              filters={filters}
              genres={genres}
              services={services}
              onChange={setFilters}
              onApply={() => runSearch(query)}
              onClear={clearFilters}
            />
          )}
        </div>

        {activeFilterLabels.length > 0 && (
          <section className="mt-6 flex flex-wrap gap-2">
            {activeFilterLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-300"
              >
                {label}
              </span>
            ))}
          </section>
        )}

        {isSearching && (
          <p className="mt-8 text-neutral-400">Searching...</p>
        )}

        {error && <p className="mt-8 text-red-500">{error}</p>}

        {total !== null && !isSearching && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-neutral-400">
              Found {total} result{total === 1 ? "" : "s"}
              {query.trim() ? ` for "${query}"` : ""}
            </p>

            <button
              type="button"
              onClick={() => runSearch(query)}
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
            >
              Refresh results
            </button>
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </section>

        {total === 0 && !isSearching && (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-xl font-semibold">No results found</h2>
            <p className="mt-2 text-neutral-400">
              Try removing a filter, using a broader keyword, or searching by
              genre instead.
            </p>
          </div>
        )}

        {total === null && !error && !isSearching && (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-xl font-semibold">Start discovering</h2>
            <p className="mt-2 text-neutral-400">
              Search for a title, use a quick search, speak into voice search,
              or apply filters to browse the catalog.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}