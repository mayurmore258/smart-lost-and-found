import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Item(Base):
    __tablename__ = "items"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    type = Column(String(10), nullable=False, index=True)  # 'lost' or 'found'
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    color = Column(String(50), nullable=False)
    brand = Column(String(100), nullable=True)
    location = Column(String(200), nullable=False)
    date_time = Column(String(100), nullable=False)
    image_path = Column(String(500), nullable=False)
    embedding = Column(Text, nullable=True)  # JSON-encoded float array
    status = Column(String(30), nullable=False, default="active", index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    lost_matches = relationship(
        "Match",
        foreign_keys="Match.lost_item_id",
        back_populates="lost_item",
        cascade="all, delete-orphan",
    )
    found_matches = relationship(
        "Match",
        foreign_keys="Match.found_item_id",
        back_populates="found_item",
        cascade="all, delete-orphan",
    )


class Match(Base):
    __tablename__ = "matches"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    lost_item_id = Column(String(36), ForeignKey("items.id"), nullable=False, index=True)
    found_item_id = Column(String(36), ForeignKey("items.id"), nullable=False, index=True)
    similarity = Column(Float, nullable=False)
    assessment = Column(String(50), nullable=False)  # 'potential_match', 'uncertain', 'no_match'
    reasons = Column(Text, nullable=False)  # JSON array of reasons
    status = Column(String(30), nullable=False, default="pending")  # 'pending', 'verified', 'rejected', 'resolved'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    lost_item = relationship("Item", foreign_keys=[lost_item_id], back_populates="lost_matches")
    found_item = relationship("Item", foreign_keys=[found_item_id], back_populates="found_matches")
    verifications = relationship("Verification", back_populates="match", cascade="all, delete-orphan")


class Verification(Base):
    __tablename__ = "verifications"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    match_id = Column(String(36), ForeignKey("matches.id"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    match = relationship("Match", back_populates="verifications")
