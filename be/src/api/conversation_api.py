"""
@Time: 2024/12/01 20:00
@Author: Amagi_Yukisaki
@File: conversation_api.py
"""

from datetime import datetime
from flask_jwt_extended import jwt_required
import pytz

from datetime import datetime
import pytz

from flask_restful import Resource, request, reqparse
from app import db, config
from model.conversation import Conversation
from model.line import Line
from model.message import Message, MessageStatus, MessageType
import requests


class Conversation_API(Resource):
    @jwt_required()
    def get(self):
        conversation_id = request.args.get('id', None, type=int)
        start = request.args.get('start', 0, type=int)
        limit = request.args.get('limit', 10, type=int)

        if not conversation_id:
            return {
                'error': 'conversation_id is required'
            }, 400
        conversation = Conversation.query.get(conversation_id)
        messages = Message.query.filter_by(conversation_id=conversation_id).order_by(
            Message.id.desc()).offset(start).limit(limit + 1).all()
        has_next = len(messages) > limit
        messages = messages[:limit]

        try:
            ret = []
            for message in messages:
                if message.status == MessageStatus.RECEIVED:
                    message.status = MessageStatus.READ
                ret.append(
                    {
                        'display_time': message.display_time.astimezone(config['TIMEZONE']).strftime('%Y-%m-%d %H:%M:%S'),
                        'content': message.content,
                        'type': message.message_type.value,
                        'status': message.status.value,
                    })
            db.session.commit()
            return {
                'peer_number': conversation.peer_number,
                'via_line_number': conversation.line.number,
                'has_next': has_next,
                'line_id': conversation.line_id,
                'messages': ret,
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
    @jwt_required()
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('line_id', type=int, required=False,
                            help='line_id and peer_number or conversation_id', location='json')
        parser.add_argument('peer_number', type=str, required=False,
                            help='line_id and peer_number or conversation_id', location='json')
        parser.add_argument('conversation_id', type=int, required=False,
                            help='line_id and peer_number or conversation_id', location='json')
        parser.add_argument('content', type=str, required=True,
                            help='content is required', location='json')
        args = parser.parse_args()
        line_id = args['line_id']
        peer_number = args['peer_number']
        conversation_id = args['conversation_id']

        if not (line_id and peer_number) and not conversation_id:
            return {
                'error': '(line_id and peer_number) or (conversation_id) is required'
            }, 400
        if (line_id and peer_number) and conversation_id:
            return {
                'error': '(line_id and peer_number) and (conversation_id) are exclusive'
            }, 400

        try:
            if line_id and peer_number:
                line = Line.query.get(line_id)
                if not line:
                    return {
                        'error': 'line not found'
                    }, 404
                conversation = Conversation.query.filter_by(
                    peer_number=peer_number, line_id=line_id).first()
                if not conversation:
                    conversation = Conversation(
                        peer_number=peer_number, line_id=line_id)
                    db.session.add(conversation)
                    db.session.flush()
            else:
                conversation = Conversation.query.get(conversation_id)
                line = conversation.line
                if not conversation:
                    return {
                        'error': 'conversation not found'
                    }, 404
            message = Message(
                line_id=line.id,
                conversation_id=conversation.id,
                message_type=MessageType.OUT,
                status=MessageStatus.SENDING,
                content=args['content'],
                display_time=datetime.now(config['TIMEZONE'])
            )
            db.session.add(message)
            db.session.flush()
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

        # now call the message sending API
        try:
            res = requests.post(config["SEND_API_SCHEME"].format(line.endpoint), json={
                'data': {
                    'sim_slot': line.sim_slot,
                    'phone_numbers': conversation.peer_number,
                    'msg_content': message.content
                },
                'timestamp': int(datetime.now().timestamp() * 1000),
                'sign': ''
            })
            if res.status_code != 200:
                raise Exception(res.text)
            message.status = MessageStatus.SENT
            db.session.commit()
            return {
                'display_time': message.display_time.astimezone(config['TIMEZONE']).strftime('%Y-%m-%d %H:%M:%S'),
                'content': message.content,
                'type': message.message_type.value,
                'status': message.status.value,
            }, 200
        except Exception as e:
            message.status = MessageStatus.ERROR
            db.session.commit()
            return {'message': str(e)}, 500
