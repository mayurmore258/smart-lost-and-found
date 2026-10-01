import json
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class MatchCandidateResponse(BaseModel):
    found_item_id: str
    similarity: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")
    assessment: str = Field(..., description="potential_match, uncertain, or no_match")
    reasons: List[str] = Field(default_factory=list, description="Reasoning breakdown")


class ItemMatchResponse(BaseModel):
    item_id: str
    status: str
    matches: List[MatchCandidateResponse]


class MatchDetailResponse(BaseModel):
    id: str
    lost_item_id: str
    found_item_id: str
    similarity: float
    assessment: str
    reasons: List[str]
    status: str
    created_at: datetime

    @classmethod
    def from_model(cls, match):
        reasons_list = []
        if match.reasons:
            try:
                reasons_list = json.loads(match.reasons)
            except Exception:
                reasons_list = [match.reasons]
        return cls(
            id=match.id,
            lost_item_id=match.lost_item_id,
            found_item_id=match.found_item_id,
            similarity=match.similarity,
            assessment=match.assessment,
            reasons=reasons_list,
            status=match.status,
            created_at=match.created_at,
        )


class ItemMatchesListResponse(BaseModel):
    item_id: str
    item_status: str
    total_matches: int
    matches: List[MatchDetailResponse]
