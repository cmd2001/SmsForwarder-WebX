"""
@Time: 2024/12/01 21:00
@Author: Amagi_Yukisaki
@File: register_api.py
"""

from api.conversation_api import Conversation_API
from api.conversation_list_api import Conversation_List_API
from api.line_api import Line_API
from api.message_api import Message_API
from api.user_api import User_API
from flask_restful import Api


def register_api(api: Api):
    api.add_resource(Conversation_API, "/api/v1/conversation")
    api.add_resource(Conversation_List_API, "/api/v1/conversation/list")
    api.add_resource(Line_API, "/api/v1/line")
    api.add_resource(Message_API, "/api/v1/message")
    api.add_resource(User_API, "/api/v1/login")
