"""
@Time: 2024/12/01 20:00
@Author: Amagi_Yukisaki
@File: message_api.py
"""

from datetime import datetime

from flask import request
from flask_restx import Resource, reqparse
from app import api, db, config
from model.conversation import Conversation
from model.line import Line, LineType
from model.message import Message, MessageType, MessageStatus
import requests


def detect_line_type(ua: str) -> str:
    if 'Android' in ua:
        return LineType.SMSFORWARDER
    return LineType.UNKNOWN


@api.route('/api/v1/message')
class Message_API(Resource):
    def post(self):  # this api is defined to be used in intra-service communication, so it is only protected by a plain token
        parser = reqparse.RequestParser()
        parser.add_argument('from', type=str, required=True,
                            help='from is required', location='json')
        parser.add_argument('content', type=str, required=True,
                            help='content is required', location='json')
        parser.add_argument('timestamp', type=str, required=True,
                            help='timestamp is required', location='json')
        parser.add_argument('device_mark', type=str, required=True,
                            help='device_mark is required', location='json')
        parser.add_argument('card_slot', type=str, required=True,
                            help='card_slot is required', location='json')
        parser.add_argument('receive_time', type=str, required=True,
                            help='receive_time is required', location='json')
        parser.add_argument('token', type=str, required=True,
                            help='token is required', location='json')
        args = parser.parse_args()

        if args['token'] != config['BACKEND_TOKEN']:
            return {'message': 'Invalid token'}, 401

        sim_slot = args['card_slot'].split('_')[0][-1]
        line_number = args['card_slot'].split('_')[-1]
        line_type = detect_line_type(request.user_agent.string)
        addr = request.remote_addr

        if not line_number and line_type == LineType.SMSFORWARDER:
            endpoint = f"http://{addr}:5000/config/query"
            try:
                r = requests.post(endpoint, json={})
                if r.status_code == 200:
                    resp = r.json()
                    line_number = resp['data']['sim_info_list'][str(
                        int(sim_slot) - 1)]['number']
            except Exception as e:
                api.logger.error(
                    f"Failed to fetch line number from device: {e}")

        try:
            line = Line.query.filter_by(number=line_number).first()
            if not line:
                line = Line(number=line_number, sim_slot=sim_slot,
                            device_mark=args['device_mark'], addr=addr)
                db.session.add(line)
                db.session.flush()
            if line.sim_slot != sim_slot:
                line.sim_slot = sim_slot
            if line.device_mark != args['device_mark']:
                line.device_mark = args['device_mark']
            if line.addr != addr:
                line.addr = addr

            conversation = Conversation.query.filter_by(
                peer_number=args['from'], line_id=line.id).first()
            if not conversation:
                conversation = Conversation(
                    peer_number=args['from'], line_id=line.id)
                db.session.add(conversation)
                db.session.flush()

            message = Message(
                conversation_id=conversation.id,
                message_type=MessageType.IN,
                status=MessageStatus.RECEIVED,
                content=args['content'],
                display_time=datetime.strptime(
                    args['receive_time'], '%Y-%m-%d %H:%M:%S').replace(tzinfo=config['TIMEZONE'])
            )
            db.session.add(message)
            db.session.flush()
            conversation.last_message_id = message.id

            db.session.commit()
            return {'message': 'success'}, 200
        except Exception as e:
            db.session.rollback()
            api.logger.error(f"Failed to save message: {e}")
            return {'message': str(e)}, 500
