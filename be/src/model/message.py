"""
@Time: 2024/12/01 19:30
@Author: Amagi_Yukisaki
@File: message.py
"""

from app import db
import enum
from sqlalchemy import Column, DateTime, Integer, String, Enum, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
# from model.line import Line
# from model.conversation import Conversation


class MessageType(enum.Enum):
    IN = 'IN'
    OUT = 'OUT'


class MessageStatus(enum.Enum):
    SENDING = 'SENDING'  # by default for OUT message
    SENT = 'SENT'  # Sent for OUT message
    RECEIVED = 'RECEIVED'  # by default for IN message
    READ = 'READ'  # Read for IN message
    ERROR = 'ERROR'  # Error for OUT message


class Message(db.Model):
    __tablename__ = 'message'
    id = Column(Integer, primary_key=True, autoincrement=True)
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    line_id: Mapped[int] = mapped_column(ForeignKey("line.id"), nullable=False)
    line: Mapped["Line"] = relationship()

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversation.id"), nullable=False)
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", foreign_keys='Message.conversation_id')

    message_type = Column(Enum(MessageType), nullable=False)
    status = Column(Enum(MessageStatus), nullable=False)
    content = Column(String(511), nullable=False)
    display_time = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return "<Message(id='%s', content='%s', line_id='%s', conversation_id='%s', status = '%s')>" % (
            self.id, self.content, self.line_id, self.conversation_id, self.status
        )

    def to_json(self):
        return {
            'id': self.id,
            'line_id': self.line_id,
            'conversation_id': self.conversation_id,
            'message_type': self.message_type,
            'status': self.status,
            'content': self.content,
            'display_time': self.display_time
        }
