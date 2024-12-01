"""
@Time: 2024/12/01 21:00
@Author: Amagi_Yukisaki
@File: debug_entry.py
"""

from app import create_app
from register_api import register_api
from flask_cors import CORS

app, api = create_app()

if __name__ == '__main__':
    register_api(api)
    CORS(app)
    app.run(host='0.0.0.0', port=8000, debug=True)
