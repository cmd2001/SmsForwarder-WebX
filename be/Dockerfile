FROM python:3.12
ADD requirements.txt .
RUN pip install -r requirements.txt

ADD ./src /app
ADD entrypoint.sh /app/
WORKDIR /app

ENTRYPOINT ["./entrypoint.sh"]