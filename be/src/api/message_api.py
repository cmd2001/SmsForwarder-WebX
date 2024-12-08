"""
@Time: 2024/12/01 20:00
@Author: Amagi_Yukisaki
@File: message_api.py
"""

from datetime import datetime

from flask import request
from flask_restx import Resource, reqparse
from app import api, config
from tasks.message_tasks import handle_receive_message


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

        handle_receive_message.delay({
            "peer_number": args['from'],
            "content": args['content'],
            "timestamp": args['timestamp'],
            "device_mark": args['device_mark'],
            "card_slot": args['card_slot'],
            "receive_time": args['receive_time'],
            "remote_addr": request.remote_addr,
            "user_agent": request.user_agent.string
        })

        return {'message': 'success'}, 200
