"""
@Time: 2024/12/01 21:00
@Author: Amagi_Yukisaki
@File: wsgi.py
"""

from app import create_app
from register_api import register_api


app, api = create_app()
register_api(api)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
