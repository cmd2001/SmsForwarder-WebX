"""
@Time: 2024/12/08 20:00
@Author: Amagi_Yukisaki
@File: message_tasks.py
"""

from celery import shared_task
from app import db, config
from model.conversation import Conversation
from model.line import Line, LineType
from model.message import Message, MessageType, MessageStatus
import requests
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def detect_line_type(ua: str) -> str:
    if 'Android' in ua:
        return LineType.SMSFORWARDER
    return LineType.UNKNOWN


@shared_task()
def handle_receive_message(args: dict) -> None:
    sim_slot = args['card_slot'].split('_')[0][-1]
    line_number = args['card_slot'].split('_')[-1]
    line_type = detect_line_type(args['user_agent'])
    addr = args['remote_addr']

    if not line_number and line_type == LineType.SMSFORWARDER:
        endpoint = f"http://{addr}:5000/config/query"
        try:
            r = requests.post(endpoint, json={})
            if r.status_code == 200:
                resp = r.json()
                line_number = resp['data']['sim_info_list'][str(
                    int(sim_slot) - 1)]['number']
        except Exception as e:
            logger.error(
                f"Failed to fetch line number from device: {e}")

    try:
        line = Line.query.filter_by(number=line_number).first()
        if not line:
            line = Line(number=line_number, sim_slot=sim_slot,
                        device_mark=args["device_mark"], addr=addr)
            db.session.add(line)
            db.session.flush()
        if line.sim_slot != sim_slot:
            line.sim_slot = sim_slot
        if line.device_mark != args["device_mark"]:
            line.device_mark = args["device_mark"]
        if line.addr != addr:
            line.addr = addr

        conversation = Conversation.query.filter_by(
            peer_number=args["peer_number"], line_id=line.id).first()
        if not conversation:
            conversation = Conversation(
                peer_number=args["peer_number"], line_id=line.id)
            db.session.add(conversation)
            db.session.flush()

        message = Message(
            conversation_id=conversation.id,
            message_type=MessageType.IN,
            status=MessageStatus.RECEIVED,
            content=args["content"],
            display_time=datetime.strptime(
                args["receive_time"], '%Y-%m-%d %H:%M:%S').replace(tzinfo=config['TIMEZONE'])
        )
        db.session.add(message)
        db.session.flush()
        conversation.last_message_id = message.id
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to save message: {e}")


@shared_task()
def handle_send_message(args: dict) -> None:
    message_id = args['message_id']
    sim_slot = args['sim_slot']
    phone_numbers = args['phone_numbers']
    msg_content = args['msg_content']
    addr = args['addr']

    message = Message.query.get(message_id)
    if not message:
        logger.error(f"Message not found: {message_id}")
        return
    try:
        if not config["DEBUG"]:
            res = requests.post(config["SEND_API_SCHEME"].format(args['addr']), json={
                'data': {
                    'sim_slot': args['sim_slot'],
                    'phone_numbers': args['phone_numbers'],
                    'msg_content': args['msg_content']
                },
                'timestamp': int(datetime.now().timestamp() * 1000),
                'sign': ''
            })
            if res.status_code != 200:
                raise Exception(res.text)
        message.status = MessageStatus.SENT
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to send message: {e}")
