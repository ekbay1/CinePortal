"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type BillingPlan = {
  key: string;
  name: string;
  description: string;
  price_display: string;
  plan_type: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function BillingPage() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loadingPlanKey, setLoadingPlanKey] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      const response = await fetch(`${API_BASE_URL}/api/billing/plans`);
      const data = (await response.json()) as BillingPlan[];
      setPlans(data);
    }

    fetchPlans();
  }, []);

  async function startCheckout(planKey: string) {
    if (!token) {
        setError("You must be logged in to subscribe.");
        return;
    }

    setError(null);
    setLoadingPlanKey(planKey);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/billing/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_key: planKey,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create checkout session.");
      }

      const data = (await response.json()) as { checkout_url: string };

      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoadingPlanKey(null);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
          CinePortal
        </p>

        <h1 className="text-4xl font-bold">Billing and Add-ons</h1>

        <p className="mt-3 max-w-2xl text-neutral-400">
          Subscribe to the base CinePortal plan or add streaming add-ons in Stripe test mode.
        </p>

        {error && <p className="mt-4 text-red-500">{error}</p>}

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.key}
              className="rounded-xl border border-neutral-800 bg-neutral-950 p-5"
            >
              <p className="text-sm uppercase tracking-wide text-neutral-500">
                {plan.plan_type}
              </p>

              <h2 className="mt-2 text-2xl font-semibold">{plan.name}</h2>

              <p className="mt-3 text-neutral-400">{plan.description}</p>

              <p className="mt-5 text-xl font-bold">{plan.price_display}</p>

              <button
                type="button"
                onClick={() => startCheckout(plan.key)}
                disabled={loadingPlanKey === plan.key}
                className="mt-5 rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
              >
                {loadingPlanKey === plan.key ? "Starting..." : "Subscribe"}
              </button>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}