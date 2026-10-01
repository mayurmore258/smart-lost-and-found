from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field

ItemStatus = Literal["active", "potential_match", "verified", "resolved", "closed"]
ItemType = Literal["lost", "found"]


class ItemBase(BaseModel):
    description: str
    category: str
    color: str
    brand: Optional[str] = None
    location: str
    date_time: str


class ItemCreate(ItemBase):
    type: ItemType


class ItemStatusUpdate(BaseModel):
    status: ItemStatus = Field(..., description="Target status: active, potential_match, verified, resolved, closed")


class ItemResponse(ItemBase):
    id: str
    type: ItemType
    image_path: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
