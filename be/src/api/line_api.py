"""
@Time: 2024/12/01 20:00
@Author: Amagi_Yukisaki
@File: line_api.py
"""

from flask_restx import Resource, reqparse
from model.line import Line
from flask_jwt_extended import jwt_required
from app import api, db


@api.route('/api/v1/line')
class Line_API(Resource):
    @jwt_required()
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=False,
                            help='line_id is required', location='args')
        args = parser.parse_args()
        line_id = args.get('id')
        if line_id:
            line = Line.query.filter_by(id=line_id).first()
            if not line:
                return {'message': 'Line not found'}, 404
            return line.to_json(), 200
        lines = Line.query.all()
        return [line.to_json() for line in lines], 200

    @jwt_required()
    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=True,
                            help='line_id is required', location='args')
        args = parser.parse_args()
        line_id = args.get('id')
        line = Line.query.get(line_id)
        if not line:
            return {'message': 'Line not found'}, 404
        try:
            db.session.delete(line)
            db.session.commit()
            return {'message': 'Line deleted'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

    @jwt_required()
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=False,
                            help='line_id to edit', location='args')
        parser.add_argument('number', type=str, required=False,
                            help='edit line number', location='json')
        parser.add_argument('sim_slot', type=int, required=False,
                            help='edit sim slot', location='json')
        parser.add_argument('device_mark', type=str, required=False,
                            help='edit device mark', location='json')
        parser.add_argument('endpoint', type=str, required=False,
                            help='edit endpoint, hostname only as full endpoint will be generated with scheme', location='json')
        args = parser.parse_args()
        line_id, number, sim_slot, device_mark, endpoint = args.get(
            'id'), args.get('number'), args.get('sim_slot'), args.get('device_mark'), args.get('endpoint')
        if not line_id:
            return {'message': 'line_id is required'}, 400
        line = Line.query.get(line_id)
        if not line:
            return {'message': 'Line not found'}, 404
        try:
            if number:
                line.number = number
            if sim_slot:
                line.sim_slot = sim_slot
            if device_mark:
                line.device_mark = device_mark
            if endpoint:
                line.endpoint = endpoint
            db.session.commit()
            return line.to_json(), 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
