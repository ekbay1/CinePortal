"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/context/ProfileContext";

export default function ProfilesPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const {
    profiles,
    activeProfile,
    isLoadingProfiles,
    selectProfile,
    createNewProfile,
  } = useProfiles();

  const [name, setName] = useState("");
  const [maturityRating, setMaturityRating] = useState("PG-13");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleCreateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Profile name is required.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createNewProfile({
        name: name.trim(),
        maturity_rating: maturityRating,
      });

      setName("");
      setMaturityRating("PG-13");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create profile."
      );
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading || isLoadingProfiles) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading profiles...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
              StreamHub AI
            </p>

            <h1 className="text-4xl font-bold">Choose a profile</h1>

            {activeProfile && (
              <p className="mt-3 text-neutral-400">
                Active profile: {activeProfile.name}
              </p>
            )}
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-900"
          >
            Dashboard
          </Link>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {profiles.map((profile) => {
            const isActive = activeProfile?.id === profile.id;

            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => selectProfile(profile.id)}
                className={
                  isActive
                    ? "rounded-xl border border-white bg-neutral-900 p-5 text-left"
                    : "rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-left hover:bg-neutral-900"
                }
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800 text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </div>

                <h2 className="text-xl font-semibold">{profile.name}</h2>

                <p className="mt-2 text-sm text-neutral-400">
                  Maturity rating: {profile.maturity_rating}
                </p>

                {isActive && (
                  <p className="mt-3 text-sm font-medium text-white">
                    Selected
                  </p>
                )}
              </button>
            );
          })}
        </section>

        <section className="mt-10 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          <h2 className="text-2xl font-semibold">Create a new profile</h2>

          <form onSubmit={handleCreateProfile} className="mt-5 grid gap-4 md:grid-cols-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Profile name"
              className="rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-white"
            />

            <select
              value={maturityRating}
              onChange={(event) => setMaturityRating(event.target.value)}
              className="rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-white"
            >
              <option value="G">G</option>
              <option value="PG">PG</option>
              <option value="PG-13">PG-13</option>
              <option value="R">R</option>
              <option value="TV-PG">TV-PG</option>
              <option value="TV-14">TV-14</option>
              <option value="TV-MA">TV-MA</option>
            </select>

            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Profile"}
            </button>
          </form>

          {error && <p className="mt-4 text-red-500">{error}</p>}
        </section>

        <div className="mt-8 flex gap-4">
          <Link
            href="/browse"
            className="rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-neutral-200"
          >
            Browse Content
          </Link>

          <Link
            href="/watchlist"
            className="rounded-lg border border-neutral-700 px-6 py-3 font-medium text-white hover:bg-neutral-900"
          >
            View Watchlist
          </Link>
        </div>
      </section>
    </main>
  );
}