"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  createBillingPortalSession,
  listSubscriptions,
} from "@/lib/api";
import {
  getActiveAddOns,
  getBaseSubscription,
  isSubscriptionActive,
} from "@/lib/billing-utils";
import { Subscription } from "@/types/billing";

export default function SubscriptionsPage() {
  const { token, isLoading, isAuthenticated } = useAuth();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseSubscription = useMemo(
    () => getBaseSubscription(subscriptions),
    [subscriptions]
  );

  const activeAddOns = useMemo(
    () => getActiveAddOns(subscriptions),
    [subscriptions]
  );

  async function loadSubscriptions() {
    if (!token) {
      return;
    }

    setIsLoadingSubscriptions(true);
    setError(null);

    try {
      const data = await listSubscriptions(token);
      setSubscriptions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load subscriptions."
      );
    } finally {
      setIsLoadingSubscriptions(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadSubscriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function openBillingPortal() {
    if (!token) {
      setError("You must be logged in to manage billing.");
      return;
    }

    setIsOpeningPortal(true);
    setError(null);

    try {
      const data = await createBillingPortalSession(token);
      window.location.href = data.portal_url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to open billing portal."
      );
    } finally {
      setIsOpeningPortal(false);
    }
  }

  if (isLoading || isLoadingSubscriptions) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading subscriptions...
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <section className="max-w-xl text-center">
          <h1 className="text-4xl font-bold">Log in required</h1>

          <p className="mt-4 text-neutral-400">
            You need to log in before viewing subscriptions.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-neutral-200"
          >
            Log In
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
              StreamHub AI
            </p>

            <h1 className="text-4xl font-bold">My Subscriptions</h1>

            <p className="mt-3 text-neutral-400">
              View your active base plan, add-ons, and Stripe subscription
              status.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/billing"
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-900"
            >
              Billing
            </Link>

            {subscriptions.length > 0 && (
              <button
                type="button"
                onClick={openBillingPortal}
                disabled={isOpeningPortal}
                className="rounded-lg bg-white px-4 py-2 font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
              >
                {isOpeningPortal ? "Opening..." : "Manage Billing"}
              </button>
            )}
          </div>
        </div>

        {error && <p className="mt-8 text-red-500">{error}</p>}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm uppercase tracking-wide text-neutral-500">
              Base Plan
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {baseSubscription ? baseSubscription.plan_name : "None"}
            </h2>

            <p className="mt-2 text-neutral-400">
              {baseSubscription
                ? `Status: ${baseSubscription.status}`
                : "No active base plan."}
            </p>
          </article>

          <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm uppercase tracking-wide text-neutral-500">
              Active Add-ons
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {activeAddOns.length}
            </h2>

            <p className="mt-2 text-neutral-400">
              Connected streaming-service add-ons.
            </p>
          </article>

          <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm uppercase tracking-wide text-neutral-500">
              Total Records
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {subscriptions.length}
            </h2>

            <p className="mt-2 text-neutral-400">
              Includes active and inactive Stripe records.
            </p>
          </article>
        </section>

        {subscriptions.length === 0 ? (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-2xl font-semibold">No subscriptions yet</h2>

            <p className="mt-2 text-neutral-400">
              Subscribe to a base plan or add-on from the billing page.
            </p>

            <Link
              href="/billing"
              className="mt-5 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
            >
              View Plans
            </Link>
          </div>
        ) : (
          <section className="mt-8 space-y-4">
            {subscriptions.map((subscription) => (
              <article
                key={subscription.id}
                className="rounded-xl border border-neutral-800 bg-neutral-950 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {subscription.plan_name}
                    </h2>

                    <p className="mt-2 text-neutral-400">
                      Status:{" "}
                      <span
                        className={
                          isSubscriptionActive(subscription)
                            ? "text-green-500"
                            : "text-neutral-400"
                        }
                      >
                        {subscription.status}
                      </span>
                    </p>

                    <p className="mt-2 text-sm text-neutral-500">
                      Created:{" "}
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="rounded-lg border border-neutral-800 px-3 py-2 text-xs text-neutral-400">
                    {subscription.stripe_subscription_id ?? "No Stripe ID"}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <button
          type="button"
          onClick={loadSubscriptions}
          className="mt-8 rounded-lg border border-neutral-700 px-5 py-3 font-medium hover:bg-neutral-900"
        >
          Refresh Subscriptions
        </button>
      </section>
    </main>
  );
}