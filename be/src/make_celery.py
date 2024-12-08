"""
@Time: 2024/12/08 20:00
@Author: Amagi_Yukisaki
@File: make_celery.py
"""

from app import create_app

flask_app, _ = create_app()
celery_app = flask_app.extensions["celery"]
