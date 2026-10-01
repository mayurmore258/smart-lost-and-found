import json
from typing import Optional, List
from sqlalchemy.orm import Session
from app.database.models import Item, Match, Verification


class ItemRepository:
    @staticmethod
    def create(db: Session, **kwargs) -> Item:
        item = Item(**kwargs)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def get_by_id(db: Session, item_id: str) -> Optional[Item]:
        return db.query(Item).filter(Item.id == item_id).first()

    @staticmethod
    def get_by_type(db: Session, item_type: str) -> List[Item]:
        return db.query(Item).filter(Item.type == item_type).order_by(Item.created_at.desc()).all()

    @staticmethod
    def get_searchable_found_items(db: Session) -> List[Item]:
        """Retrieve found items that are active and possess an embedding."""
        return (
            db.query(Item)
            .filter(
                Item.type == "found",
                Item.status == "active",
                Item.embedding.isnot(None),
            )
            .all()
        )

    @staticmethod
    def update_status(db: Session, item_id: str, new_status: str) -> Optional[Item]:
        item = db.query(Item).filter(Item.id == item_id).first()
        if item:
            item.status = new_status
            db.commit()
            db.refresh(item)
        return item


class MatchRepository:
    @staticmethod
    def create(db: Session, **kwargs) -> Match:
        # Serialize reasons if list
        if isinstance(kwargs.get("reasons"), list):
            kwargs["reasons"] = json.dumps(kwargs["reasons"])
        match = Match(**kwargs)
        db.add(match)
        db.commit()
        db.refresh(match)
        return match

    @staticmethod
    def get_by_id(db: Session, match_id: str) -> Optional[Match]:
        return db.query(Match).filter(Match.id == match_id).first()

    @staticmethod
    def get_by_lost_item(db: Session, lost_item_id: str) -> List[Match]:
        return (
            db.query(Match)
            .filter(Match.lost_item_id == lost_item_id)
            .order_by(Match.similarity.desc(), Match.created_at.desc())
            .all()
        )

    @staticmethod
    def update_status(db: Session, match_id: str, new_status: str) -> Optional[Match]:
        match = db.query(Match).filter(Match.id == match_id).first()
        if match:
            match.status = new_status
            db.commit()
            db.refresh(match)
        return match


class VerificationRepository:
    @staticmethod
    def create(db: Session, **kwargs) -> Verification:
        verification = Verification(**kwargs)
        db.add(verification)
        db.commit()
        db.refresh(verification)
        return verification

    @staticmethod
    def get_by_id(db: Session, verification_id: str) -> Optional[Verification]:
        return db.query(Verification).filter(Verification.id == verification_id).first()

    @staticmethod
    def get_by_match_id(db: Session, match_id: str) -> Optional[Verification]:
        return (
            db.query(Verification)
            .filter(Verification.match_id == match_id)
            .order_by(Verification.created_at.desc())
            .first()
        )

    @staticmethod
    def update_answer(db: Session, verification_id: str, answer: str, verified: bool) -> Optional[Verification]:
        verification = db.query(Verification).filter(Verification.id == verification_id).first()
        if verification:
            verification.answer = answer
            verification.verified = verified
            db.commit()
            db.refresh(verification)
        return verification
