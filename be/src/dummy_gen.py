import random
import datetime
from model.message import Message
from model.line import Line
from model.conversation import Conversation
from app import create_app, db
app, api = create_app()


with app.app_context():
    for i in range(1, 6):
        number_line = '888888888' + str(i)
        line = Line(number=number_line, sim_slot=i,
                    device_mark=f"device_mark{i}", endpoint=f"endpoint{i}")
        db.session.add(line)
    db.session.commit()

    for i in range(1, 6):
        line_number = '888888888' + str(i)
        line = Line.query.filter_by(number=line_number).first()
        for j in range(1, 6):
            peer_number = '999999999' + str(j)
            conversation = Conversation(
                line_id=i, peer_number=peer_number, last_message_id=None)
            db.session.add(conversation)
            db.session.flush()
            for k in range(1, 20):
                if random.randint(0, 100) % 4 != 0:
                    message_type = 'IN'
                    status = 'RECEIVED'
                else:
                    message_type = 'OUT'
                    status = 'SENT'
                # YY-MM-DD HH:MM:SS
                display_time = datetime.datetime.now() - datetime.timedelta(seconds=60 * (20-k))
                message = Message(
                    line_id=i, conversation_id=conversation.id, message_type=message_type, status=status, content=f"content_{i}_{j}_{k}", display_time=display_time)
                db.session.add(message)
                db.session.flush()
                conversation.last_message_id = message.id
            db.session.commit()
    db.session.commit()
