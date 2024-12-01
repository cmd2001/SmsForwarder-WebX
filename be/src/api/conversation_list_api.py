"""
@Time: 2024/12/01 20:00
@Author: Amagi_Yukisaki
@File: conversation_list_api.py
"""

from flask_jwt_extended import jwt_required
import pytz


from flask_restful import Resource, request
from app import config
from model.conversation import Conversation
from model.message import MessageStatus


class Conversation_List_API(Resource):
    @jwt_required()
    def get(self):
        start = request.args.get('start', 0, type=int)
        limit = request.args.get('limit', 10, type=int)
        # conversations = Conversation.query.order_by(
        #     Conversation.last_message.display_time.desc()).offset(start).limit(limit + 1).all()
        conversations = Conversation.query.order_by(
            Conversation.last_message_id).offset(start).limit(limit + 1).all()
        has_next = len(conversations) > limit
        conversations = conversations[:limit]
        ret = []
        for conversation in conversations:
            ret.append(
                {
                    'conversation_id': conversation.id,
                    'last_message_time': conversation.last_message.display_time.astimezone(config['TIMEZONE']).strftime(
                        '%Y-%m-%d %H:%M:%S'),
                    'last_message_content': conversation.last_message.content,
                    'last_message_is_unread': conversation.last_message.status == MessageStatus.RECEIVED,
                    'peer_number': conversation.peer_number,
                    'via_line_number': conversation.line.number,
                })
        return {
            'conversations': ret,
            'has_next': has_next,
        }, 200
