"""
@Time: 2024/12/01 20:00
@Author: Amagi_Yukisaki
@File: conversation_list_api.py
"""

from flask_jwt_extended import jwt_required


from flask_restx import Resource, reqparse
from app import api, config
from model.conversation import Conversation
from model.message import MessageStatus, Message


@api.route('/api/v1/conversation/list')
class Conversation_List_API(Resource):
    @jwt_required()
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('start', type=int, required=False,
                            help='start is required', location='args')
        parser.add_argument('limit', type=int, required=False,
                            help='limit is required', location='args')
        args = parser.parse_args()
        start, limit = args.get('start'), args.get('limit')

        conversations = Conversation.query.order_by(
            Conversation.last_message_id.desc()).offset(start).limit(limit + 1).all()
        has_next = len(conversations) > limit
        conversations = conversations[:limit]
        ret = []
        for conversation in conversations:
            last_message = Message.query.filter_by(
                id=conversation.last_message_id).first()
            ret.append(
                {
                    'conversation_id': conversation.id,
                    'last_message_time': last_message.display_time.astimezone(config['TIMEZONE']).strftime(
                        '%Y-%m-%d %H:%M:%S'),
                    'last_message_content': last_message.content,
                    'last_message_is_unread': last_message.status == MessageStatus.RECEIVED,
                    'peer_number': conversation.peer_number,
                    'via_line_number': conversation.line.number,
                })
        return {
            'conversations': ret,
            'has_next': has_next,
        }, 200
