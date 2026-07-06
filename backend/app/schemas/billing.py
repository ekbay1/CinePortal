from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BillingPlanRead(BaseModel):
    key: str
    name: str
    description: str
    price_display: str
    plan_type: str


class CheckoutSessionCreate(BaseModel):
    plan_key: str


class CheckoutSessionRead(BaseModel):
    checkout_url: str


class SubscriptionRead(BaseModel):
    id: int
    user_id: int
    plan_name: str
    status: str
    stripe_customer_id: str | None = None
    stripe_subscription_id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)