from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.repositories import ItemRepository, MatchRepository
from app.schemas.match import ItemMatchesListResponse, MatchDetailResponse
from app.utils.errors import ItemNotFoundException

router = APIRouter(prefix="/matches", tags=["Matches"])


@router.get(
    "/{item_id}",
    response_model=ItemMatchesListResponse,
    summary="Get Matches for Item",
)
async def get_matches_for_item(
    item_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve latest potential matches and current match status for an item.
    """
    item = ItemRepository.get_by_id(db, item_id)
    if not item:
        raise ItemNotFoundException(item_id)

    matches = MatchRepository.get_by_lost_item(db, item_id)
    match_responses = [MatchDetailResponse.from_model(m) for m in matches]

    return ItemMatchesListResponse(
        item_id=item.id,
        item_status=item.status,
        total_matches=len(match_responses),
        matches=match_responses,
    )
