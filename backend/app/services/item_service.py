from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.database.models import Item
from app.database.repositories import ItemRepository
from app.services.image_service import ImageService
from app.services.clip_service import clip_service
from app.utils.errors import InvalidStatusException, ItemNotFoundException


class ItemService:
    ALLOWED_STATUSES = ["active", "potential_match", "verified", "resolved", "closed"]

    @staticmethod
    async def create_item(
        db: Session,
        item_type: str,  # 'lost' or 'found'
        image: UploadFile,
        description: str,
        category: str,
        color: str,
        location: str,
        date_time: str,
        brand: Optional[str] = None,
    ) -> Item:
        # 1. Validate & store image
        relative_path, abs_path = await ImageService.save_uploaded_image(image)

        # 2. Compute CLIP embedding
        embedding_vector = clip_service.generate_image_embedding(abs_path)
        embedding_str = clip_service.serialize_embedding(embedding_vector)

        # 3. Save to database
        item = ItemRepository.create(
            db,
            type=item_type,
            description=description,
            category=category,
            color=color,
            brand=brand,
            location=location,
            date_time=date_time,
            image_path=relative_path,
            embedding=embedding_str,
            status="active",
        )

        return item

    @staticmethod
    def update_item_status(db: Session, item_id: str, new_status: str) -> Item:
        if new_status not in ItemService.ALLOWED_STATUSES:
            raise InvalidStatusException(new_status, ItemService.ALLOWED_STATUSES)

        item = ItemRepository.get_by_id(db, item_id)
        if not item:
            raise ItemNotFoundException(item_id)

        updated = ItemRepository.update_status(db, item_id, new_status)
        return updated


item_service = ItemService()
