import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.billing import (
    BillingPlanRead,
    BillingPortalSessionRead,
    CheckoutSessionCreate,
    CheckoutSessionRead,
    SubscriptionRead,
)
from app.services.billing_service import (
    create_billing_portal_session,
    create_checkout_session,
    get_public_billing_plans,
    list_subscriptions_for_user,
    update_subscription_status,
    upsert_subscription_from_stripe,
)

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.get("/plans", response_model=list[BillingPlanRead])
def read_billing_plans():
    return get_public_billing_plans()


@router.post("/create-checkout-session", response_model=CheckoutSessionRead)
def create_billing_checkout_session(
    checkout_in: CheckoutSessionCreate,
    current_user: User = Depends(get_current_user),
):
    try:
        checkout_url = create_checkout_session(
            user=current_user,
            plan_key=checkout_in.plan_key,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except stripe.StripeError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Stripe error: {str(error)}",
        ) from error

    return CheckoutSessionRead(checkout_url=checkout_url)


@router.get("/subscriptions", response_model=list[SubscriptionRead])
def read_my_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_subscriptions_for_user(
        db=db,
        user_id=current_user.id,
    )


@router.post("/create-portal-session", response_model=BillingPortalSessionRead)
def create_customer_portal_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        portal_url = create_billing_portal_session(
            db=db,
            user=current_user,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except stripe.StripeError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Stripe error: {str(error)}",
        ) from error

    return BillingPortalSessionRead(portal_url=portal_url)


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="stripe-signature"),
    db: Session = Depends(get_db),
):
    payload = await request.body()

    if stripe_signature is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature.",
        )

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=settings.stripe_webhook_secret,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook payload.",
        ) from error
    except stripe.SignatureVerificationError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature.",
        ) from error

    event_type = event["type"]
    event_object = event["data"]["object"]

    if event_type == "checkout.session.completed":
        metadata = event_object.get("metadata", {})

        user_id = metadata.get("user_id")
        plan_name = metadata.get("plan_name", "Unknown Plan")

        if user_id:
            upsert_subscription_from_stripe(
                db=db,
                user_id=int(user_id),
                plan_name=plan_name,
                status="active",
                stripe_customer_id=event_object.get("customer"),
                stripe_subscription_id=event_object.get("subscription"),
            )

    elif event_type in {
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    }:
        stripe_subscription_id = event_object.get("id")
        subscription_status = event_object.get("status", "unknown")
        metadata = event_object.get("metadata", {})

        user_id = metadata.get("user_id")
        plan_name = metadata.get("plan_name", "Unknown Plan")
        stripe_customer_id = event_object.get("customer")

        if user_id:
            upsert_subscription_from_stripe(
                db=db,
                user_id=int(user_id),
                plan_name=plan_name,
                status=subscription_status,
                stripe_customer_id=stripe_customer_id,
                stripe_subscription_id=stripe_subscription_id,
            )
        elif stripe_subscription_id:
            update_subscription_status(
                db=db,
                stripe_subscription_id=stripe_subscription_id,
                status=subscription_status,
            )

    return {"received": True}
