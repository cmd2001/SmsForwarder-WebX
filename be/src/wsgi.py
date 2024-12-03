"""
@Time: 2024/12/01 21:00
@Author: Amagi_Yukisaki
@File: wsgi.py
"""

from app import create_app

app, api = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
