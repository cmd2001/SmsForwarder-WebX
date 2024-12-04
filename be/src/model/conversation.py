"""
@Time: 2024/12/01 19:30
@Author: Amagi_Yukisaki
@File: conversation.py
"""

from typing import List
from app import db
from sqlalchemy import Column, DateTime, Integer, String, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Conversation(db.Model):
    __tablename__ = 'conversation'
    id = Column(Integer, primary_key=True, autoincrement=True)
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    line_id: Mapped[int] = mapped_column(ForeignKey(
        "line.id", ondelete="CASCADE"), nullable=False)
    line: Mapped["Line"] = relationship()

    peer_number = Column(String(255), nullable=False)

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete",
    )
    last_message_id = Column(Integer, nullable=True)

    def __repr__(self):
        return "<Conversation(id='%s', peer_number='%s', line_id='%s')>" % (
            self.id, self.peer_number, self.line_id
        )

    def to_json(self):
        return {
            'id': self.id,
            'peer_number': self.peer_number,
            'line_id': self.line_id
        }
