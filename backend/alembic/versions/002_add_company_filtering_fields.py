"""Add company filtering fields

Revision ID: 002
Revises: 001
Create Date: 2025-10-28

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to companies table
    op.add_column('companies', sa.Column('company_type', sa.String(100), nullable=True))
    op.add_column('companies', sa.Column('business_categories', sa.Text(), nullable=True))
    op.add_column('companies', sa.Column('raw_materials_focus', sa.Text(), nullable=True))


def downgrade():
    # Remove columns
    op.drop_column('companies', 'raw_materials_focus')
    op.drop_column('companies', 'business_categories')
    op.drop_column('companies', 'company_type')
