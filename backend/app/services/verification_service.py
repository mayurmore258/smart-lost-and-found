import logging
from sqlalchemy.orm import Session
from app.database.models import Match, Verification, Item
from app.database.repositories import MatchRepository, VerificationRepository, ItemRepository
from app.utils.errors import MatchNotFoundException

logger = logging.getLogger(__name__)


class VerificationService:
    @staticmethod
    def verify_answer(
        db: Session,
        match_id: str,
        user_answer: str,
    ) -> tuple[bool, str]:
        """
        Validates the user's answer against the verification question and found item details.
        Updates verification record, match status, and item status.
        Does NOT expose private information.
        """
        match = MatchRepository.get_by_id(db, match_id)
        if not match:
            raise MatchNotFoundException(match_id)

        # Retrieve verification record associated with match
        verification = VerificationRepository.get_by_match_id(db, match_id)
        if not verification:
            # Create a verification record on the fly if not already generated
            verification = VerificationRepository.create(
                db,
                match_id=match.id,
                question="Can you confirm a unique detail of the item?",
                answer=user_answer,
                verified=False,
            )

        # Retrieve found item to compare details
        found_item = ItemRepository.get_by_id(db, match.found_item_id)
        lost_item = ItemRepository.get_by_id(db, match.lost_item_id)

        answer_clean = user_answer.strip().lower()

        # Deterministic verification check for MVP:
        # Check if user's answer matches brand, color, or distinctive terms in found item description
        is_verified = False
        message = ""

        if found_item and len(answer_clean) >= 2:
            found_desc = (found_item.description or "").lower()
            found_brand = (found_item.brand or "").lower()
            found_color = (found_item.color or "").lower()

            # Stopwords to filter out generic tokens
            stopwords = {"the", "and", "with", "this", "that", "there", "have", "some", "item", "plain", "completely", "without", "inside"}
            answer_tokens = [t.strip(".,!?:;") for t in answer_clean.split()]
            answer_tokens = [t for t in answer_tokens if len(t) > 3 and t not in stopwords]

            # Check for strong match: brand match or specific distinctive token from description
            matches_brand = bool(found_brand and found_brand in answer_clean)
            
            # Count distinctive matching tokens
            matching_tokens = [t for t in answer_tokens if t in found_desc]
            matches_desc = len(matching_tokens) >= 1 and (found_brand in answer_clean or len(matching_tokens) >= 2 or any(len(t) > 6 for t in matching_tokens))

            if matches_brand or matches_desc:
                is_verified = True
                message = "Verification successful. Ownership confirmed."
            else:
                is_verified = False
                message = "Verification response did not match item records."
        else:
            is_verified = False
            message = "Insufficient verification details provided."

        # Update verification record
        VerificationRepository.update_answer(
            db,
            verification_id=verification.id,
            answer=user_answer,
            verified=is_verified,
        )

        # Update match status and item status based on verification outcome
        if is_verified:
            MatchRepository.update_status(db, match_id=match.id, new_status="verified")
            if lost_item:
                ItemRepository.update_status(db, item_id=lost_item.id, new_status="verified")
            if found_item:
                ItemRepository.update_status(db, item_id=found_item.id, new_status="resolved")
        else:
            MatchRepository.update_status(db, match_id=match.id, new_status="rejected")

        return is_verified, message


verification_service = VerificationService()
