"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Subscription = {
  id: number;
  plan_name: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function SubscriptionsPage() {
  const { token, isLoading, isAuthenticated } = useAuth();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
        setError("You must be logged in to view subscriptions.");
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/billing/subscriptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load subscriptions.");
      }

      const data = (await response.json()) as Subscription[];
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">My Subscriptions</h1>

        <form onSubmit={handleSubmit} className="mt-6">
        <button
            type="submit"
            disabled={isFetching}
            className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
        >
            {isFetching ? "Loading..." : "Load Subscriptions"}
        </button>
        </form>

        {error && <p className="mt-4 text-red-500">{error}</p>}

        <div className="mt-8 space-y-4">
          {subscriptions.map((subscription) => (
            <article
              key={subscription.id}
              className="rounded-xl border border-neutral-800 bg-neutral-950 p-5"
            >
              <h2 className="text-xl font-semibold">{subscription.plan_name}</h2>
              <p className="mt-2 text-neutral-400">Status: {subscription.status}</p>
              <p className="mt-1 text-sm text-neutral-500">
                Stripe subscription: {subscription.stripe_subscription_id ?? "N/A"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}