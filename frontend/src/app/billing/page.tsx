"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  createBillingPortalSession,
  createCheckoutSession,
  listBillingPlans,
  listSubscriptions,
} from "@/lib/api";
import {
  getActiveAddOns,
  getActiveSubscriptionForPlan,
  getBaseSubscription,
} from "@/lib/billing-utils";
import type { BillingPlan, Subscription } from "@/types/billing";

export default function BillingPage() {
  const { token, isAuthenticated, isLoading } = useAuth();

  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingPlanKey, setLoadingPlanKey] = useState<string | null>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(true);
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

  useEffect(() => {
    async function loadBillingData() {
      setIsLoadingBilling(true);
      setError(null);

      try {
        const planData = await listBillingPlans();
        setPlans(planData);

        if (token) {
          const subscriptionData = await listSubscriptions(token);
          setSubscriptions(subscriptionData);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load billing data."
        );
      } finally {
        setIsLoadingBilling(false);
      }
    }

    if (!isLoading) {
      loadBillingData();
    }
  }, [token, isLoading]);

  async function startCheckout(planKey: string) {
    if (!token) {
      setError("You must be logged in to subscribe.");
      return;
    }

    setLoadingPlanKey(planKey);
    setError(null);

    try {
      const data = await createCheckoutSession(token, planKey);
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoadingPlanKey(null);
    }
  }

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

  const basePlans = plans.filter((plan) => plan.plan_type === "base");
  const addOnPlans = plans.filter((plan) => plan.plan_type === "addon");

  if (isLoading || isLoadingBilling) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading billing...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
              StreamHub AI
            </p>

            <h1 className="text-4xl font-bold">Billing and Add-ons</h1>

            <p className="mt-3 max-w-2xl text-neutral-400">
              Manage your StreamHub base plan and streaming-service add-ons
              using Stripe test mode.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-900"
            >
              Dashboard
            </Link>

            <Link
              href="/account/subscriptions"
              className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-900"
            >
              My Subscriptions
            </Link>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-2xl font-semibold">Log in to subscribe</h2>
            <p className="mt-2 text-neutral-400">
              You can view plans, but you need an account to start checkout.
            </p>

            <Link
              href="/login"
              className="mt-5 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
            >
              Log In
            </Link>
          </div>
        )}

        {error && <p className="mt-8 text-red-500">{error}</p>}

        {isAuthenticated && (
          <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Current Plan</h2>

                {baseSubscription ? (
                  <p className="mt-2 text-neutral-300">
                    Active base plan:{" "}
                    <span className="font-semibold">
                      {baseSubscription.plan_name}
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 text-neutral-400">
                    No active base plan yet.
                  </p>
                )}

                <p className="mt-2 text-neutral-500">
                  Active add-ons: {activeAddOns.length}
                </p>
              </div>

              {subscriptions.length > 0 && (
                <button
                  type="button"
                  onClick={openBillingPortal}
                  disabled={isOpeningPortal}
                  className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
                >
                  {isOpeningPortal ? "Opening..." : "Manage Billing"}
                </button>
              )}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Base Plan</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {basePlans.map((plan) => {
              const activeSubscription = getActiveSubscriptionForPlan(
                plan,
                subscriptions
              );

              return (
                <article
                  key={plan.key}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 p-5"
                >
                  <p className="text-sm uppercase tracking-wide text-neutral-500">
                    {plan.plan_type}
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">{plan.name}</h3>

                  <p className="mt-3 text-neutral-400">{plan.description}</p>

                  <p className="mt-5 text-xl font-bold">
                    {plan.price_display}
                  </p>

                  {activeSubscription ? (
                    <div className="mt-5 rounded-lg border border-neutral-700 px-4 py-3 text-sm text-neutral-300">
                      Active · {activeSubscription.status}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startCheckout(plan.key)}
                      disabled={loadingPlanKey === plan.key}
                      className="mt-5 rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
                    >
                      {loadingPlanKey === plan.key
                        ? "Starting..."
                        : "Subscribe"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Streaming Add-ons</h2>

          <p className="mt-2 text-neutral-400">
            Add connected streaming services to your subscription bundle.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {addOnPlans.map((plan) => {
              const activeSubscription = getActiveSubscriptionForPlan(
                plan,
                subscriptions
              );

              return (
                <article
                  key={plan.key}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 p-5"
                >
                  <p className="text-sm uppercase tracking-wide text-neutral-500">
                    {plan.plan_type}
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">{plan.name}</h3>

                  <p className="mt-3 text-sm text-neutral-400">
                    {plan.description}
                  </p>

                  <p className="mt-5 text-lg font-bold">
                    {plan.price_display}
                  </p>

                  {activeSubscription ? (
                    <div className="mt-5 rounded-lg border border-neutral-700 px-4 py-3 text-sm text-neutral-300">
                      Active · {activeSubscription.status}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startCheckout(plan.key)}
                      disabled={loadingPlanKey === plan.key}
                      className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
                    >
                      {loadingPlanKey === plan.key ? "Starting..." : "Add"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}