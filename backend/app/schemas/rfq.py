from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RFQBase(BaseModel):
    title: str
    material_category: Optional[str] = None
    quantity: Optional[str] = None
    target_price: Optional[str] = None
    specifications: Optional[str] = None
    delivery_deadline: Optional[datetime] = None
    delivery_location: Optional[str] = None
    required_certifications: Optional[str] = None  # JSON string
    preferred_suppliers: Optional[str] = None  # JSON string
    attachments: Optional[str] = None  # JSON string
    visibility: str = "public"  # public, private, invited_only
    # Enhanced RFQ fields
    part_number: Optional[str] = None
    part_number_description: Optional[str] = None
    delivery_plant: Optional[str] = None
    yearly_quantity: Optional[str] = None
    moq_required: Optional[str] = None
    price_unit: Optional[str] = None  # e.g., "per piece", "per kg"
    unit_of_measure: Optional[str] = None  # e.g., "kg", "units", "meters"
    currency: Optional[str] = None  # e.g., "USD", "EUR", "GBP"
    incoterm: Optional[str] = None  # e.g., "FOB", "CIF", "EXW", "DDP"
    commodity: Optional[str] = None


class RFQCreate(RFQBase):
    expires_at: Optional[datetime] = None


class RFQUpdate(BaseModel):
    title: Optional[str] = None
    material_category: Optional[str] = None
    quantity: Optional[str] = None
    target_price: Optional[str] = None
    specifications: Optional[str] = None
    delivery_deadline: Optional[datetime] = None
    delivery_location: Optional[str] = None
    required_certifications: Optional[str] = None
    preferred_suppliers: Optional[str] = None
    attachments: Optional[str] = None
    visibility: Optional[str] = None
    status: Optional[str] = None
    expires_at: Optional[datetime] = None
    # Enhanced RFQ fields
    part_number: Optional[str] = None
    part_number_description: Optional[str] = None
    delivery_plant: Optional[str] = None
    yearly_quantity: Optional[str] = None
    moq_required: Optional[str] = None
    price_unit: Optional[str] = None
    unit_of_measure: Optional[str] = None
    currency: Optional[str] = None
    incoterm: Optional[str] = None
    commodity: Optional[str] = None


class RFQResponse(RFQBase):
    id: str
    status: str
    expires_at: Optional[datetime] = None
    view_count: int
    response_count: int
    created_at: datetime
    buyer_company_name: Optional[str] = None

    class Config:
        from_attributes = True


class RFQList(BaseModel):
    id: str
    title: str
    material_category: Optional[str] = None
    quantity: Optional[str] = None
    target_price: Optional[str] = None
    delivery_deadline: Optional[datetime] = None
    status: str
    expires_at: Optional[datetime] = None
    view_count: int
    response_count: int
    created_at: datetime
    buyer_company_name: Optional[str] = None
    # Enhanced fields for list view
    part_number: Optional[str] = None
    commodity: Optional[str] = None
    currency: Optional[str] = None
    incoterm: Optional[str] = None

    class Config:
        from_attributes = True


class RFQDetail(RFQBase):
    id: str
    status: str
    expires_at: Optional[datetime] = None
    view_count: int
    response_count: int
    created_at: datetime
    updated_at: datetime
    buyer_company_name: Optional[str] = None
    buyer_company_id: str

    class Config:
        from_attributes = True


# RFQ Response schemas
class RFQResponseBase(BaseModel):
    price_quote: Optional[str] = None
    lead_time_days: Optional[int] = None
    minimum_order_quantity: Optional[str] = None
    message: Optional[str] = None
    attachments: Optional[str] = None  # JSON string
    certifications_provided: Optional[str] = None  # JSON string
    # Enhanced Supplier Response fields
    supplier_part_number: Optional[str] = None
    production_batch_size: Optional[str] = None
    supplier_moq: Optional[str] = None
    supplier_unit_of_measure: Optional[str] = None  # e.g., "kg", "units", "meters"
    production_lead_time_days: Optional[int] = None  # Calendar days
    raw_material_type: Optional[str] = None
    raw_material_cost: Optional[str] = None  # Currency/kg format


class RFQResponseCreate(RFQResponseBase):
    pass


class RFQResponseUpdate(BaseModel):
    price_quote: Optional[str] = None
    lead_time_days: Optional[int] = None
    minimum_order_quantity: Optional[str] = None
    message: Optional[str] = None
    attachments: Optional[str] = None
    certifications_provided: Optional[str] = None
    status: Optional[str] = None
    # Enhanced Supplier Response fields
    supplier_part_number: Optional[str] = None
    production_batch_size: Optional[str] = None
    supplier_moq: Optional[str] = None
    supplier_unit_of_measure: Optional[str] = None
    production_lead_time_days: Optional[int] = None
    raw_material_type: Optional[str] = None
    raw_material_cost: Optional[str] = None


class RFQResponseDetail(RFQResponseBase):
    id: str
    rfq_id: str
    supplier_company_id: str
    supplier_company_name: Optional[str] = None
    responding_poc_id: str
    responding_poc_name: Optional[str] = None
    status: str
    responded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True