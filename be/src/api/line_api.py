"""
@Time: 2024/12/01 20:00
@Author: Amagi_Yukisaki
@File: line_api.py
"""

from flask_restful import Resource, request
from model.line import Line
from flask_jwt_extended import jwt_required


class Line_API(Resource):
    @jwt_required()
    def get(self):
        line_id = request.args.get('id', type=int)
        line = Line.query.filter_by(id=line_id).first()
        if not line:
            return {'message': 'Line not found'}, 404
        return line.to_json(), 200
