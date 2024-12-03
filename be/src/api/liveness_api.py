"""
@Time: 2024/12/03 15:30
@Author: Amagi_Yukisaki
@File: liveness_api.py
"""

from flask_restx import Resource
from app import api


@api.route('/api/v1/liveness')
class Liveness_API(Resource):
    def get(self):
        return {'message': 'Server Online'}, 200
