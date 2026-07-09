from sqlalchemy.orm import Session, joinedload

from app.models.support import ChatbotMessage, SupportTicket
from app.schemas.chatbot import ChatbotResponse


def detect_intent(message: str) -> tuple[str, str, list[str], bool]:
    normalized = message.lower().strip()

    billing_keywords = ["bill", "billing", "charged", "charge", "payment", "invoice", "receipt"]
    cancel_keywords = ["cancel", "unsubscribe", "end subscription", "stop subscription"]
    password_keywords = ["password", "login", "log in", "sign in", "locked out", "reset"]
    playback_keywords = [
        "buffer",
        "buffering",
        "playback",
        "video",
        "quality",
        "stream",
        "loading",
        "lag",
    ]
    addon_keywords = [
        "add-on",
        "addon",
        "disney",
        "peacock",
        "max",
        "hbo",
        "prime",
        "subscription add",
    ]
    refund_keywords = ["refund", "money back", "wrong charge"]
    human_keywords = ["human", "agent", "representative", "support person", "real person"]

    if any(keyword in normalized for keyword in cancel_keywords):
        return (
            "cancel_subscription",
            "You can cancel a subscription from Account Settings > Subscriptions. Select the base plan or add-on you want to cancel, then confirm cancellation. Your access should remain active until the end of the billing period.",
            [
                "Open subscription settings",
                "Show active subscriptions",
                "Create support ticket if cancellation fails",
            ],
            False,
        )

    if any(keyword in normalized for keyword in billing_keywords):
        return (
            "billing",
            "For billing issues, check Account Settings > Billing. You should be able to view your current plan, add-ons, invoices, receipts, and next renewal date.",
            [
                "View invoices",
                "Check next renewal date",
                "Update payment method",
            ],
            False,
        )

    if any(keyword in normalized for keyword in password_keywords):
        return (
            "account_access",
            "For login or password issues, use the password reset option on the login page. If you still cannot access your account, a support ticket can be created.",
            [
                "Send password reset email",
                "Check account email address",
                "Create support ticket",
            ],
            False,
        )

    if any(keyword in normalized for keyword in playback_keywords):
        return (
            "playback",
            "For playback issues, try refreshing the page, checking your internet connection, lowering video quality, disabling VPNs, or restarting the app/device.",
            [
                "Run playback troubleshooting",
                "Lower video quality",
                "Check service status",
            ],
            False,
        )

    if any(keyword in normalized for keyword in addon_keywords):
        return (
            "streaming_addons",
            "Streaming add-ons can be managed from Account Settings > Add-ons. You can add, remove, or view the status of services like Disney+, Peacock, Max, and Prime Video.",
            [
                "View add-ons",
                "Add a streaming service",
                "Remove an add-on",
            ],
            False,
        )

    if any(keyword in normalized for keyword in refund_keywords):
        return (
            "refund_request",
            "Refund requests need to be reviewed by support. I can create a support ticket with your message so a support representative can follow up.",
            [
                "Create refund support ticket",
                "View billing history",
            ],
            True,
        )

    if any(keyword in normalized for keyword in human_keywords):
        return (
            "human_support",
            "I can escalate this to a human support representative by creating a support ticket.",
            [
                "Create support ticket",
            ],
            True,
        )

    return (
        "unknown",
        "I’m not fully sure how to solve that yet. I can create a support ticket so a support representative can review your issue.",
        [
            "Create support ticket",
            "Try rephrasing the question",
        ],
        True,
    )


def create_support_ticket(
    db: Session,
    user_id: int,
    subject: str,
    user_message: str,
    bot_reply: str,
) -> SupportTicket:
    ticket = SupportTicket(
        user_id=user_id,
        subject=subject,
        status="open",
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    user_chat_message = ChatbotMessage(
        ticket_id=ticket.id,
        sender="user",
        message=user_message,
    )

    bot_chat_message = ChatbotMessage(
        ticket_id=ticket.id,
        sender="bot",
        message=bot_reply,
    )

    db.add(user_chat_message)
    db.add(bot_chat_message)
    db.commit()
    db.refresh(ticket)

    return ticket


def handle_chatbot_message(
    db: Session,
    user_id: int,
    message: str,
    create_ticket_if_unresolved: bool = True,
) -> ChatbotResponse:
    category, reply, suggested_actions, should_escalate = detect_intent(message)

    ticket_id = None
    escalated = False

    if should_escalate and create_ticket_if_unresolved:
        ticket = create_support_ticket(
            db=db,
            user_id=user_id,
            subject=f"Support request: {category.replace('_', ' ').title()}",
            user_message=message,
            bot_reply=reply,
        )

        ticket_id = ticket.id
        escalated = True

    return ChatbotResponse(
        reply=reply,
        category=category,
        escalated=escalated,
        ticket_id=ticket_id,
        suggested_actions=suggested_actions,
    )


def list_support_tickets_for_user(
    db: Session,
    user_id: int,
) -> list[SupportTicket]:
    return (
        db.query(SupportTicket)
        .options(joinedload(SupportTicket.messages))
        .filter(SupportTicket.user_id == user_id)
        .order_by(SupportTicket.created_at.desc())
        .all()
    )


def get_support_ticket_for_user(
    db: Session,
    ticket_id: int,
    user_id: int,
) -> SupportTicket | None:
    return (
        db.query(SupportTicket)
        .options(joinedload(SupportTicket.messages))
        .filter(
            SupportTicket.id == ticket_id,
            SupportTicket.user_id == user_id,
        )
        .first()
    )


def close_support_ticket(
    db: Session,
    ticket: SupportTicket,
) -> SupportTicket:
    ticket.status = "closed"

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket
