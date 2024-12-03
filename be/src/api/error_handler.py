"""
@Time: 2024/12/03 16:00
@Author: Amagi_Yukisaki
@File: error_handler.py
"""

from jwt import DecodeError
from app import api, app


@api.errorhandler(DecodeError)
@app.errorhandler(DecodeError)
def handle_decode_error(e):
    response = {
        "status": 401,
        "message": "Invalid token",
        "success": False}
    return response, 401
