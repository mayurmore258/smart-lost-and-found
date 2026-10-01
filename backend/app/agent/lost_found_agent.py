import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.database.models import Item, Match
from app.database.repositories import ItemRepository, MatchRepository, VerificationRepository
from app.services.similarity_service import similarity_service
from app.services.llm_service import llm_service
from app.services.image_service import ImageService
from app.schemas.match import ItemMatchResponse, MatchCandidateResponse
from app.utils.errors import ItemNotFoundException, AppException

logger = logging.getLogger(__name__)


class LostFoundAgent:
    """
    Intelligent Agent coordinating:
    1. Retrieval of visually similar found items via local CLIP embeddings
    2. Candidate shortlisting (top-K)
    3. Multi-modal/contextual reasoning via LLM service (two-level provider fallback)
    4. Decision making & verification step formulation
    5. Database status updates
    """

    async def match_lost_item(self, db: Session, lost_item_id: str) -> ItemMatchResponse:
        # 1. Fetch lost item
        lost_item = ItemRepository.get_by_id(db, lost_item_id)
        if not lost_item:
            raise ItemNotFoundException(lost_item_id)

        if lost_item.type != "lost":
            raise AppException(
                code="INVALID_ITEM_TYPE",
                message=f"Item '{lost_item_id}' is a {lost_item.type} report. Matching can only be initiated on 'lost' items.",
            )

        # 2. Retrieve searchable FOUND items
        searchable_found_items = ItemRepository.get_searchable_found_items(db)

        # 3. Find top visually similar candidates via CLIP cosine similarity
        top_candidates = similarity_service.find_top_candidates(
            lost_item=lost_item,
            found_items=searchable_found_items,
        )

        # If no candidates found by similarity
        if not top_candidates:
            logger.info(f"No visually similar candidates found for lost item {lost_item_id}.")
            return ItemMatchResponse(
                item_id=lost_item_id,
                status="no_match",
                matches=[],
            )

        lost_data: Dict[str, Any] = {
            "id": lost_item.id,
            "category": lost_item.category,
            "description": lost_item.description,
            "color": lost_item.color,
            "brand": lost_item.brand,
            "location": lost_item.location,
            "date_time": lost_item.date_time,
        }

        match_candidate_responses: List[MatchCandidateResponse] = []
        has_potential_match = False
        has_uncertain_match = False

        # 4. Reason ONLY over shortlisted candidates using LLM (never entire DB)
        for found_item, sim_score in top_candidates:
            found_data: Dict[str, Any] = {
                "id": found_item.id,
                "category": found_item.category,
                "description": found_item.description,
                "color": found_item.color,
                "brand": found_item.brand,
                "location": found_item.location,
                "date_time": found_item.date_time,
            }

            found_image_abs_path = ImageService.get_full_path(found_item.image_path)

            # LLM evaluation with capability-aware model selection & two-level fallback
            reasoning = await llm_service.evaluate_candidate(
                lost_data=lost_data,
                found_data=found_data,
                similarity=sim_score,
                found_image_path=found_image_abs_path,
                require_vision=bool(found_image_abs_path and found_image_abs_path.exists()),
            )

            # Agent Decision logic:
            assessment = reasoning.assessment  # 'potential_match', 'uncertain', 'no_match'
            if sim_score >= 0.75 and assessment in ["potential_match", "uncertain"]:
                assessment = "potential_match"
                has_potential_match = True
            elif sim_score >= 0.45 or assessment == "potential_match":
                if assessment == "potential_match":
                    has_potential_match = True
                else:
                    assessment = "uncertain"
                    has_uncertain_match = True
            else:
                assessment = "no_match"

            # Persist Match record
            match_record = MatchRepository.create(
                db,
                lost_item_id=lost_item.id,
                found_item_id=found_item.id,
                similarity=sim_score,
                assessment=assessment,
                reasons=reasoning.reasons,
                status="pending",
            )

            # If potential match or uncertain, generate verification question step
            if assessment in ["potential_match", "uncertain"]:
                VerificationRepository.create(
                    db,
                    match_id=match_record.id,
                    question=reasoning.verification_question,
                    verified=False,
                )

            match_candidate_responses.append(
                MatchCandidateResponse(
                    found_item_id=found_item.id,
                    similarity=sim_score,
                    assessment=assessment,
                    reasons=reasoning.reasons,
                )
            )

        # Update item status according to agent decision
        if has_potential_match:
            final_status = "potential_match"
            ItemRepository.update_status(db, lost_item.id, "potential_match")
        elif has_uncertain_match:
            final_status = "uncertain"
        else:
            final_status = "no_match"

        return ItemMatchResponse(
            item_id=lost_item.id,
            status=final_status,
            matches=match_candidate_responses,
        )


lost_found_agent = LostFoundAgent()
