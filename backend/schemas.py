from pydantic import BaseModel
from datetime import datetime


class NoteCreate(BaseModel):
    content: str


class NoteResponse(BaseModel):
    id: int
    user_uid: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
