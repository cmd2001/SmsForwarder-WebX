"""
@Time: 2024/12/01 19:30
@Author: Amagi_Yukisaki
@File: conversation.py
"""

from typing import List
from app import db
from sqlalchemy import Column, DateTime, Integer, String, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
# from model.line import Line
# from model.message import Message


class Conversation(db.Model):
    __tablename__ = 'conversation'
    id = Column(Integer, primary_key=True, autoincrement=True)
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    line_id: Mapped[int] = mapped_column(ForeignKey("line.id"), nullable=False)
    line: Mapped["Line"] = relationship()

    peer_number = Column(String(255), nullable=False)
    # to find conversation with latest message

    last_message_id: Mapped[int] = mapped_column(
        ForeignKey("message.id"), nullable=True)
    last_message: Mapped["Message"] = relationship(
        "Message", foreign_keys='Conversation.last_message_id')

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
