"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
              CinePortal
            </p>

            <h1 className="text-4xl font-bold">Dashboard</h1>

            <p className="mt-3 text-neutral-400">
              Signed in as {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-900"
          >
            Log out
          </button>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/search"
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
          >
            <h2 className="text-xl font-semibold">Search Content</h2>
            <p className="mt-2 text-neutral-400">
              Search movies and shows using text or voice.
            </p>
          </Link>

          <Link
            href="/support"
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
          >
            <h2 className="text-xl font-semibold">Support Chatbot</h2>
            <p className="mt-2 text-neutral-400">
              Get help with billing, playback, add-ons, or account issues.
            </p>
          </Link>

          <Link
            href="/billing"
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
          >
            <h2 className="text-xl font-semibold">Billing</h2>
            <p className="mt-2 text-neutral-400">
              Subscribe to base plans and streaming add-ons.
            </p>
          </Link>

          <Link
            href="/account/subscriptions"
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
          >
            <h2 className="text-xl font-semibold">My Subscriptions</h2>
            <p className="mt-2 text-neutral-400">
              View your local subscription status.
            </p>
          </Link>
          <Link
            href="/profiles"
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
          >
            <h2 className="text-xl font-semibold">Profiles</h2>
            <p className="mt-2 text-neutral-400">
                Choose or create a streaming profile.
            </p>
          </Link>

          <Link
            href="/browse"
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
          >
            <h2 className="text-xl font-semibold">Browse</h2>
            <p className="mt-2 text-neutral-400">
                Browse homepage rows and add titles to your watchlist.
            </p>
          </Link>

          <Link
            href="/watchlist"
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
            >
            <h2 className="text-xl font-semibold">Watchlist</h2>
            <p className="mt-2 text-neutral-400">
                View saved titles for the active profile.
            </p>
          </Link>

          <Link
            href="/continue-watching"
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
            >
            <h2 className="text-xl font-semibold">Continue Watching</h2>
            <p className="mt-2 text-neutral-400">
                View titles with saved watch progress.
            </p>
          </Link>
        <Link
          href="/recommendations"
          className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
        >
          <h2 className="text-xl font-semibold">Recommendations</h2>
          <p className="mt-2 text-neutral-400">
            View personalized recommendations for your active profile.
          </p>
        </Link>
        <Link
          href="/ratings"
          className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
        >
          <h2 className="text-xl font-semibold">Ratings</h2>
          <p className="mt-2 text-neutral-400">
            View and update your content ratings.
          </p>
        </Link>
        </section>
      </section>
    </main>
  );
}