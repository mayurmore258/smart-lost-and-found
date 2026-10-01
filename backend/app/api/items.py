from typing import Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.repositories import ItemRepository
from app.services.item_service import item_service
from app.agent.lost_found_agent import lost_found_agent
from app.schemas.item import ItemResponse, ItemStatusUpdate
from app.schemas.match import ItemMatchResponse
from app.utils.errors import ItemNotFoundException

router = APIRouter(prefix="/items", tags=["Items"])


@router.post(
    "/lost",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Lost Item Report",
)
async def create_lost_item(
    image: UploadFile = File(..., description="Image file of the lost item"),
    description: str = Form(..., description="Detailed description of the lost item"),
    category: str = Form(..., description="Category (e.g., Electronics, Bags, Keys, Wallet)"),
    color: str = Form(..., description="Primary color of the item"),
    location: str = Form(..., description="Location where the item was lost"),
    date_time: str = Form(..., description="Date and time when lost"),
    brand: Optional[str] = Form(None, description="Brand name if applicable"),
    db: Session = Depends(get_db),
):
    """
    Report a lost item with image and metadata.
    Automatically generates and stores local CLIP visual embeddings.
    """
    item = await item_service.create_item(
        db=db,
        item_type="lost",
        image=image,
        description=description,
        category=category,
        color=color,
        location=location,
        date_time=date_time,
        brand=brand,
    )
    return item


@router.post(
    "/found",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Found Item Report",
)
async def create_found_item(
    image: UploadFile = File(..., description="Image file of the found item"),
    description: str = Form(..., description="Detailed description of the found item"),
    category: str = Form(..., description="Category (e.g., Electronics, Bags, Keys, Wallet)"),
    color: str = Form(..., description="Primary color of the item"),
    location: str = Form(..., description="Location where the item was found"),
    date_time: str = Form(..., description="Date and time when found"),
    brand: Optional[str] = Form(None, description="Brand name if applicable"),
    db: Session = Depends(get_db),
):
    """
    Report a found item with image and metadata.
    Generates and stores CLIP embedding so it becomes searchable for lost reports.
    """
    item = await item_service.create_item(
        db=db,
        item_type="found",
        image=image,
        description=description,
        category=category,
        color=color,
        location=location,
        date_time=date_time,
        brand=brand,
    )
    return item


@router.get(
    "/{item_id}",
    response_model=ItemResponse,
    summary="Get Item Details",
)
async def get_item(
    item_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve details of a specific item report."""
    item = ItemRepository.get_by_id(db, item_id)
    if not item:
        raise ItemNotFoundException(item_id)
    return item


@router.post(
    "/{item_id}/match",
    response_model=ItemMatchResponse,
    summary="Match Lost Item Against Found Items",
)
async def match_item(
    item_id: str,
    db: Session = Depends(get_db),
):
    """
    Initiate visual and contextual matching workflow for a LOST item:
    1. Retrieve CLIP embedding
    2. Search FOUND items only using cosine similarity
    3. Rank and retrieve top candidate matches
    4. Send ONLY shortlisted candidates to LLM reasoning
    5. Formulate verification questions and update item/match status
    """
    result = await lost_found_agent.match_lost_item(db=db, lost_item_id=item_id)
    return result


@router.patch(
    "/{item_id}/status",
    response_model=ItemResponse,
    summary="Update Item Status",
)
async def update_item_status(
    item_id: str,
    payload: ItemStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Update item status.
    Allowed statuses: active, potential_match, verified, resolved, closed.
    """
    updated_item = item_service.update_item_status(
        db=db,
        item_id=item_id,
        new_status=payload.status,
    )
    return updated_item
