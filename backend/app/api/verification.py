from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.repositories import MatchRepository, VerificationRepository
from app.services.verification_service import verification_service
from app.schemas.verification import VerifyRequest, VerifyResponse, VerificationDetail
from app.utils.errors import MatchNotFoundException

router = APIRouter(prefix="/matches", tags=["Verification"])


@router.get(
    "/{match_id}/verification-question",
    summary="Get Verification Question for Match",
)
async def get_verification_question(
    match_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve the pending verification question for a potential match.
    Does not expose sensitive or private details.
    """
    match = MatchRepository.get_by_id(db, match_id)
    if not match:
        raise MatchNotFoundException(match_id)

    verification = VerificationRepository.get_by_match_id(db, match_id)
    if not verification:
        return {
            "match_id": match_id,
            "question": "Can you describe any distinctive marking or accessory on your item?",
            "verified": False,
        }

    return {
        "match_id": match_id,
        "question": verification.question,
        "verified": verification.verified,
    }


@router.post(
    "/{match_id}/verify",
    response_model=VerifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Match Ownership",
)
async def verify_match(
    match_id: str,
    payload: VerifyRequest,
    db: Session = Depends(get_db),
):
    """
    Verify ownership of a found item by answering the verification question.
    Updates match status and item status upon successful confirmation.
    """
    is_verified, msg = verification_service.verify_answer(
        db=db,
        match_id=match_id,
        user_answer=payload.answer,
    )

    return VerifyResponse(
        verified=is_verified,
        message=msg,
    )
