import stripe
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.subscription import Subscription
from app.models.user import User

stripe.api_key = settings.stripe_secret_key


def get_billing_plans() -> dict[str, dict[str, str]]:
    return {
        "base": {
            "key": "base",
            "name": "CinePortal Base Plan",
            "description": "Access CinePortal original movies, shows, profiles, watchlists, and recommendations.",
            "price_display": "$9.99/month",
            "plan_type": "base",
            "price_id": settings.stripe_price_base,
        },
        "disney": {
            "key": "disney",
            "name": "Disney+ Add-on",
            "description": "Add Disney+ content discovery and subscription access.",
            "price_display": "$7.99/month",
            "plan_type": "addon",
            "price_id": settings.stripe_price_disney,
        },
        "max": {
            "key": "max",
            "name": "Max Add-on",
            "description": "Add Max content discovery and subscription access.",
            "price_display": "$9.99/month",
            "plan_type": "addon",
            "price_id": settings.stripe_price_max,
        },
        "peacock": {
            "key": "peacock",
            "name": "Peacock Add-on",
            "description": "Add Peacock content discovery and subscription access.",
            "price_display": "$5.99/month",
            "plan_type": "addon",
            "price_id": settings.stripe_price_peacock,
        },
        "prime": {
            "key": "prime",
            "name": "Prime Video Add-on",
            "description": "Add Prime Video content discovery and subscription access.",
            "price_display": "$8.99/month",
            "plan_type": "addon",
            "price_id": settings.stripe_price_prime,
        },
    }


def get_public_billing_plans() -> list[dict[str, str]]:
    plans = get_billing_plans()

    return [
        {
            "key": plan["key"],
            "name": plan["name"],
            "description": plan["description"],
            "price_display": plan["price_display"],
            "plan_type": plan["plan_type"],
        }
        for plan in plans.values()
    ]


def get_plan_by_key(plan_key: str) -> dict[str, str] | None:
    return get_billing_plans().get(plan_key)


def create_checkout_session(user: User, plan_key: str) -> str:
    plan = get_plan_by_key(plan_key)

    if not plan:
        raise ValueError("Invalid plan selected.")

    checkout_session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[
            {
                "price": plan["price_id"],
                "quantity": 1,
            }
        ],
        customer_email=user.email,
        success_url=f"{settings.frontend_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.frontend_url}/billing/cancel",
        metadata={
            "user_id": str(user.id),
            "plan_key": plan["key"],
            "plan_name": plan["name"],
        },
        subscription_data={
            "metadata": {
                "user_id": str(user.id),
                "plan_key": plan["key"],
                "plan_name": plan["name"],
            }
        },
    )

    return checkout_session.url


def list_subscriptions_for_user(
    db: Session,
    user_id: int,
) -> list[Subscription]:
    return (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id)
        .order_by(Subscription.created_at.desc())
        .all()
    )


def upsert_subscription_from_stripe(
    db: Session,
    user_id: int,
    plan_name: str,
    status: str,
    stripe_customer_id: str | None,
    stripe_subscription_id: str | None,
) -> Subscription:
    subscription = None

    if stripe_subscription_id:
        subscription = (
            db.query(Subscription)
            .filter(Subscription.stripe_subscription_id == stripe_subscription_id)
            .first()
        )

    if not subscription:
        subscription = Subscription(
            user_id=user_id,
            plan_name=plan_name,
            status=status,
            stripe_customer_id=stripe_customer_id,
            stripe_subscription_id=stripe_subscription_id,
        )
        db.add(subscription)
    else:
        subscription.plan_name = plan_name
        subscription.status = status
        subscription.stripe_customer_id = stripe_customer_id
        subscription.stripe_subscription_id = stripe_subscription_id

    db.commit()
    db.refresh(subscription)

    return subscription


def update_subscription_status(
    db: Session,
    stripe_subscription_id: str,
    status: str,
) -> Subscription | None:
    subscription = (
        db.query(Subscription)
        .filter(Subscription.stripe_subscription_id == stripe_subscription_id)
        .first()
    )

    if not subscription:
        return None

    subscription.status = status

    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    return subscription


def get_latest_stripe_customer_id(
    db: Session,
    user_id: int,
) -> str | None:
    subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user_id,
            Subscription.stripe_customer_id.isnot(None),
        )
        .order_by(Subscription.created_at.desc())
        .first()
    )

    if not subscription:
        return None

    return subscription.stripe_customer_id


def create_billing_portal_session(
    db: Session,
    user: User,
) -> str:
    stripe_customer_id = get_latest_stripe_customer_id(
        db=db,
        user_id=user.id,
    )

    if not stripe_customer_id:
        raise ValueError("No Stripe customer found for this user.")

    portal_session = stripe.billing_portal.Session.create(
        customer=stripe_customer_id,
        return_url=f"{settings.frontend_url}/account/subscriptions",
    )

    return portal_session.url
