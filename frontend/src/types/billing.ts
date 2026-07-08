export type BillingPlan = {
  key: string;
  name: string;
  description: string;
  price_display: string;
  plan_type: string;
};

export type Subscription = {
  id: number;
  user_id: number;
  plan_name: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};

export type CheckoutSessionResponse = {
  checkout_url: string;
};

export type BillingPortalSessionResponse = {
  portal_url: string;
};