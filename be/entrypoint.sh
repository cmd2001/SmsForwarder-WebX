#!/bin/sh

flask db upgrade
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app