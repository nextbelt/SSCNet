from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Can be null for LinkedIn-only users
    name = Column(String(255), nullable=False)
    profile_picture_url = Column(Text, nullable=True)
    
    # LinkedIn specific fields
    linkedin_id = Column(String(255), unique=True, nullable=True, index=True)
    linkedin_profile_url = Column(Text, nullable=True)
    last_linkedin_verification = Column(DateTime, nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String(50), default="pending")  # pending, verified, rejected
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company_associations = relationship("POC", back_populates="user")
    sent_rfqs = relationship("RFQ", back_populates="buyer", foreign_keys="RFQ.buyer_id")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    received_messages = relationship("Message", back_populates="recipient", foreign_keys="Message.recipient_id")


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False, index=True)
    domain = Column(String(255), nullable=True, index=True)
    
    # LinkedIn specific
    linkedin_company_id = Column(String(255), nullable=True, unique=True)
    
    # Company details
    industry = Column(String(255), nullable=True)
    headquarters_location = Column(String(255), nullable=True)
    employee_count = Column(String(50), nullable=True)  # e.g., "51-200", "1001-5000"
    founded_year = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)
    website_url = Column(Text, nullable=True)
    
    # Business verification
    duns_number = Column(String(50), nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_source = Column(String(100), nullable=True)  # linkedin, duns, manual
    
    # Capabilities and certifications (stored as JSON)
    certifications = Column(Text, nullable=True)  # JSON string
    capabilities = Column(Text, nullable=True)  # JSON string
    materials = Column(Text, nullable=True)  # JSON string
    naics_codes = Column(Text, nullable=True)  # JSON string
    
    # Performance metrics
    response_rate = Column(Integer, default=0)  # Percentage
    avg_response_time_hours = Column(Integer, nullable=True)
    total_rfqs_received = Column(Integer, default=0)
    total_rfqs_responded = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    pocs = relationship("POC", back_populates="company")
    sent_rfqs = relationship("RFQ", back_populates="buyer_company", foreign_keys="RFQ.buyer_company_id")
    received_responses = relationship("RFQResponse", back_populates="supplier_company")


class POC(Base):
    __tablename__ = "pocs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Role and status
    role = Column(String(255), nullable=True)  # e.g., "Sales Manager", "Procurement Officer"
    is_primary = Column(Boolean, default=False)
    is_on_call = Column(Boolean, default=False)
    availability_status = Column(String(50), default="available")  # available, busy, offline
    
    # Performance metrics
    avg_response_time_hours = Column(Integer, nullable=True)
    response_rate = Column(Integer, default=0)  # Percentage
    total_rfqs_handled = Column(Integer, default=0)
    
    # Timestamps
    last_active_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", back_populates="pocs")
    user = relationship("User", back_populates="company_associations")
    responses = relationship("RFQResponse", back_populates="responding_poc")


class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    buyer_company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    
    # RFQ details
    title = Column(String(255), nullable=False)
    material_category = Column(String(255), nullable=True, index=True)
    quantity = Column(String(255), nullable=True)  # e.g., "5000 kg", "100 units"
    target_price = Column(String(255), nullable=True)
    specifications = Column(Text, nullable=True)
    delivery_deadline = Column(DateTime, nullable=True)
    delivery_location = Column(String(500), nullable=True)
    
    # Requirements (stored as JSON)
    required_certifications = Column(Text, nullable=True)  # JSON string
    preferred_suppliers = Column(Text, nullable=True)  # JSON string
    attachments = Column(Text, nullable=True)  # JSON string of file URLs
    
    # Status and lifecycle
    status = Column(String(50), default="active", index=True)  # active, closed, expired, cancelled
    visibility = Column(String(50), default="public")  # public, private, invited_only
    expires_at = Column(DateTime, nullable=True)
    
    # Metrics
    view_count = Column(Integer, default=0)
    response_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    buyer = relationship("User", back_populates="sent_rfqs")
    buyer_company = relationship("Company", back_populates="sent_rfqs")
    responses = relationship("RFQResponse", back_populates="rfq")
    messages = relationship("Message", back_populates="rfq")


class RFQResponse(Base):
    __tablename__ = "rfq_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id"), nullable=False, index=True)
    supplier_company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    responding_poc_id = Column(UUID(as_uuid=True), ForeignKey("pocs.id"), nullable=False, index=True)
    
    # Response details
    status = Column(String(50), default="submitted", index=True)  # submitted, under_review, accepted, rejected
    price_quote = Column(String(255), nullable=True)
    lead_time_days = Column(Integer, nullable=True)
    minimum_order_quantity = Column(String(255), nullable=True)
    message = Column(Text, nullable=True)
    
    # Attachments and additional info
    attachments = Column(Text, nullable=True)  # JSON string of file URLs
    certifications_provided = Column(Text, nullable=True)  # JSON string
    
    # Response metrics
    is_competitive = Column(Boolean, nullable=True)
    buyer_rating = Column(Integer, nullable=True)  # 1-5 stars
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rfq = relationship("RFQ", back_populates="responses")
    supplier_company = relationship("Company", back_populates="received_responses")
    responding_poc = relationship("POC", back_populates="responses")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id"), nullable=False, index=True)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Message content
    content = Column(Text, nullable=False)
    message_type = Column(String(50), default="text")  # text, system, attachment
    attachments = Column(Text, nullable=True)  # JSON string of file URLs
    
    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    rfq = relationship("RFQ", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages", foreign_keys=[sender_id])
    recipient = relationship("User", back_populates="received_messages", foreign_keys=[recipient_id])