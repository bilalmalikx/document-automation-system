from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database.session import Base
import uuid

class TemplateField(Base):
    __tablename__ = "template_fields"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id", ondelete="CASCADE"))
    placeholder_name = Column(String(100), nullable=False)
    field_label = Column(String(200), nullable=False)
    field_type = Column(String(50), nullable=False)
    is_required = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    options = Column(JSONB, nullable=True)