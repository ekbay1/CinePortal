"use client";

import { FormEvent, useState } from "react";

import { ContentCard } from "@/components/ContentCard";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { searchContent } from "@/lib/api";
import type { Content } from "@/types/content";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Content[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(searchQuery: string) {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setResults([]);
      setTotal(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const data = await searchContent({
        q: trimmedQuery,
        limit: 20,
      });

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

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
            StreamHub AI
          </p>
          <h1 className="text-4xl font-bold">Search movies and shows</h1>
          <p className="mt-3 max-w-2xl text-neutral-400">
            Search by title, genre, description, or use your voice to find
            something to watch.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try: sci-fi thriller, family comedy, action movie..."
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-white"
          />

          <button
            type="submit"
            className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
          >
            Search
          </button>
        </form>

        <div className="mb-8">
          <VoiceSearchButton onTranscript={handleTranscript} />
        </div>

        {isSearching && <p className="text-neutral-400">Searching...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {total !== null && !isSearching && (
          <p className="mb-4 text-neutral-400">
            Found {total} result{total === 1 ? "" : "s"} for "{query}"
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </section>

        {total === 0 && !isSearching && (
          <p className="mt-8 text-neutral-400">
            No results found. Try another search.
          </p>
        )}
      </section>
    </main>
  );
}