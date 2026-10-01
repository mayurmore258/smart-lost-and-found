from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class VerifyRequest(BaseModel):
    answer: str = Field(..., min_length=1, description="Owner's answer to the verification question")


class VerifyResponse(BaseModel):
    verified: bool = Field(..., description="Whether verification succeeded")
    message: Optional[str] = Field(None, description="Optional status message")


class VerificationDetail(BaseModel):
    id: str
    match_id: str
    question: str
    answer: Optional[str] = None
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
