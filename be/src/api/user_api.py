"""
@Time: 2024/12/01 20:00
@Author: Amagi_Yukisaki
@File: user_api.py
"""

from flask_restx import Resource, reqparse
from app import api, config
from flask_jwt_extended import create_access_token


@api.route('/api/v1/login')
class User_API(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, required=True,
                            help='username is required', location='json')
        parser.add_argument('password', type=str, required=False,
                            help='password is required', location='json')
        args = parser.parse_args()
        username, password = args['username'], args['password']

        if username == config['ADMIN_USERNAME'] and password == config['ADMIN_PASSWORD']:
            access_token = create_access_token(identity=username)
            return {'access_token': access_token}, 200
        return {'message': 'Invalid username or password'}, 401
