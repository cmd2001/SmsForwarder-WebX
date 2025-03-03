"""empty message

Revision ID: 22da116e272e
Revises: 
Create Date: 2024-12-04 21:22:11.876591

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '22da116e272e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('line', schema=None) as batch_op:
        batch_op.add_column(sa.Column('line_type', sa.Enum(
            'SMSFORWARDER', 'UNKNOWN', name='linetype'), nullable=True))

    with op.batch_alter_table('line', schema=None) as batch_op:
        batch_op.execute(
            "UPDATE line SET line_type = 'SMSFORWARDER' WHERE line_type IS NULL")
        batch_op.alter_column('line_type', nullable=False)
        batch_op.alter_column('endpoint', new_column_name='addr')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('line', schema=None) as batch_op:
        batch_op.alter_column('addr', new_column_name='endpoint')
        batch_op.drop_column('line_type')

    # ### end Alembic commands ###
