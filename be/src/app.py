"""
@Time: 2024/12/01 21:00
@Author: Amagi_Yukisaki
@File: app.py
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import yaml
import datetime
from pytimeparse.timeparse import timeparse
from flask_restful import Api
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
import os
import pytz

db = SQLAlchemy()
jwt = JWTManager()
config = dict()
migrate = Migrate()


def create_app():
    app = Flask("cej-be")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DB_URI")

    global config

    config["BACKEND_TOKEN"] = os.environ.get("BACKEND_TOKEN")
    config["ADMIN_USERNAME"] = os.environ.get("ADMIN_USERNAME")
    config["ADMIN_PASSWORD"] = os.environ.get("ADMIN_PASSWORD")
    config["TIMEZONE"] = pytz.timezone(os.environ.get("TIMEZONE"))
    config["SEND_API_SCHEME"] = os.environ.get("SEND_API_SCHEME")
    config["DEBUG"] = os.environ.get("DEBUG") == "True"

    global db
    db.init_app(app)
    with app.app_context():
        db.create_all()
    migrate = Migrate(app, db)

    global jwt
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
    jwt = JWTManager(app)

    return app, Api(app)
