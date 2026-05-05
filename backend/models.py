from sqlalchemy import Column, Integer, String, Text, DateTime, func
from backend.database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key = True, index = True)
    user_uid = Column(String(128), nullable = False, index = True)
    content = Column(Text, nullable = False)
    created_at = Column(DateTime, server_default = func.now())
