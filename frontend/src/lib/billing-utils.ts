import type { BillingPlan, Subscription } from "@/types/billing";

export function isSubscriptionActive(subscription: Subscription): boolean {
  return ["active", "trialing"].includes(subscription.status);
}

export function normalizePlanName(planName: string): string {
  return planName.toLowerCase().replace(/\s+/g, " ").trim();
}

export function getActiveSubscriptionForPlan(
  plan: BillingPlan,
  subscriptions: Subscription[]
): Subscription | undefined {
  return subscriptions.find((subscription) => {
    const normalizedSubscriptionName = normalizePlanName(subscription.plan_name);
    const normalizedPlanName = normalizePlanName(plan.name);

    return (
      normalizedSubscriptionName === normalizedPlanName &&
      isSubscriptionActive(subscription)
    );
  });
}

export function getBaseSubscription(
  subscriptions: Subscription[]
): Subscription | undefined {
  return subscriptions.find((subscription) => {
    const name = normalizePlanName(subscription.plan_name);

    return name.includes("base") && isSubscriptionActive(subscription);
  });
}

export function getActiveAddOns(
  subscriptions: Subscription[]
): Subscription[] {
  return subscriptions.filter((subscription) => {
    const name = normalizePlanName(subscription.plan_name);

    return !name.includes("base") && isSubscriptionActive(subscription);
  });
}