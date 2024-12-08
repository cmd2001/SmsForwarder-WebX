"""
@Time: 2024/12/01 20:00
@Author: Amagi_Yukisaki
@File: conversation_api.py
"""

from datetime import datetime
from flask_jwt_extended import jwt_required

from datetime import datetime

from flask_restx import Resource, reqparse
from app import api, db, config
from model.conversation import Conversation
from model.line import Line
from model.message import Message, MessageStatus, MessageType
from tasks.message_tasks import handle_send_message


@api.route('/api/v1/conversation')
class Conversation_API(Resource):
    @jwt_required()
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=False,
                            help='conversation_id is required', location='args')
        parser.add_argument('start', type=int, required=False,
                            help='start is required', location='args')
        parser.add_argument('limit', type=int, required=False,
                            help='limit is required', location='args')
        args = parser.parse_args()
        conversation_id, start, limit = args.get(
            'id'), args.get('start'), args.get('limit')

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
                        'message_id': message.id,
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
            api.logger.error(F'Failed to get conversation: {str(e)}')
            return {'message': str(e)}, 500

    @jwt_required()
    def delete(self):
        conversation_id = request.args.get('id', None, type=int)
        if not conversation_id:
            return {
                'error': 'conversation_id is required'
            }, 400
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return {
                'error': 'conversation not found'
            }, 404
        try:
            Message.query.filter_by(conversation_id=conversation_id).delete()
            db.session.delete(conversation)
            db.session.commit()
            return {
                'message': 'delete success'
            }, 200
        except Exception as e:
            db.session.rollback()
            api.logger.error(F'Failed to delete conversation: {str(e)}')
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
                conversation_id=conversation.id,
                message_type=MessageType.OUT,
                status=MessageStatus.SENDING,
                content=args['content'],
                display_time=datetime.now(config['TIMEZONE'])
            )
            db.session.add(message)
            db.session.flush()
            conversation.last_message_id = message.id
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            api.logger.error(F'Failed to create message: {str(e)}')
            return {'message': str(e)}, 500

        handle_send_message.delay({
            'message_id': message.id,
            'sim_slot': line.sim_slot,
            'phone_numbers': conversation.peer_number,
            'msg_content': message.content,
            'addr': line.addr
        })

        return {
            'message_id': message.id,
            'display_time': message.display_time.astimezone(config['TIMEZONE']).strftime('%Y-%m-%d %H:%M:%S'),
            'content': message.content,
            'type': message.message_type.value,
            'status': message.status.value,
        }, 200
