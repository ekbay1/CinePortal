from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.chatbot import (
    ChatbotRequest,
    ChatbotResponse,
    SupportTicketRead,
)
from app.services.chatbot_service import (
    close_support_ticket,
    get_support_ticket_for_user,
    handle_chatbot_message,
    list_support_tickets_for_user,
)

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/message", response_model=ChatbotResponse)
def send_chatbot_message(
    chatbot_request: ChatbotRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return handle_chatbot_message(
        db=db,
        user_id=current_user.id,
        message=chatbot_request.message,
        create_ticket_if_unresolved=chatbot_request.create_ticket_if_unresolved,
    )


@router.get("/tickets", response_model=list[SupportTicketRead])
def read_support_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_support_tickets_for_user(
        db=db,
        user_id=current_user.id,
    )


@router.get("/tickets/{ticket_id}", response_model=SupportTicketRead)
def read_support_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_support_ticket_for_user(
        db=db,
        ticket_id=ticket_id,
        user_id=current_user.id,
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support ticket not found.",
        )

    return ticket


@router.patch("/tickets/{ticket_id}/close", response_model=SupportTicketRead)
def close_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_support_ticket_for_user(
        db=db,
        ticket_id=ticket_id,
        user_id=current_user.id,
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support ticket not found.",
        )

    return close_support_ticket(db=db, ticket=ticket)