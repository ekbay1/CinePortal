from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ChatbotRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    create_ticket_if_unresolved: bool = True


class ChatbotMessageRead(BaseModel):
    id: int
    ticket_id: int | None = None
    sender: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupportTicketRead(BaseModel):
    id: int
    user_id: int
    subject: str
    status: str
    created_at: datetime
    messages: list[ChatbotMessageRead] = []

    model_config = ConfigDict(from_attributes=True)


class ChatbotResponse(BaseModel):
    reply: str
    category: str
    escalated: bool
    ticket_id: int | None = None
    suggested_actions: list[str] = []
