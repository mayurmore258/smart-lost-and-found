import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from PIL import Image
import io

from app.config import settings
from app.utils.errors import InvalidImageException


class ImageService:
    @staticmethod
    async def save_uploaded_image(file: UploadFile) -> tuple[str, Path]:
        """
        Validates and stores an uploaded image file.
        Returns:
            (relative_url_path, absolute_file_path)
        """
        if not file or not file.filename:
            raise InvalidImageException("No image file provided.")

        # Check content type
        content_type = file.content_type
        if content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise InvalidImageException(
                f"Unsupported image type '{content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )

        # Read content
        try:
            content = await file.read()
        except Exception as e:
            raise InvalidImageException(f"Failed to read image file: {str(e)}")

        # Validate file size
        max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise InvalidImageException(
                f"Image file exceeds maximum limit of {settings.MAX_IMAGE_SIZE_MB}MB."
            )

        if len(content) == 0:
            raise InvalidImageException("Uploaded image file is empty.")

        # Validate with PIL to ensure it is a valid image
        try:
            pil_image = Image.open(io.BytesIO(content))
            pil_image.verify()
        except Exception as e:
            raise InvalidImageException(f"Corrupted or invalid image data: {str(e)}")

        # Determine extension
        ext = Path(file.filename).suffix.lower()
        if not ext or ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            ext = ".jpg"

        filename = f"{uuid.uuid4().hex}{ext}"
        target_path = settings.UPLOAD_DIR / filename

        # Write file to disk
        try:
            with open(target_path, "wb") as f:
                f.write(content)
        except Exception as e:
            raise InvalidImageException(f"Failed to save image to disk: {str(e)}")

        # Return web accessible path and filesystem path
        relative_path = f"/uploads/{filename}"
        return relative_path, target_path

    @staticmethod
    def get_full_path(image_path_or_url: str) -> Path:
        """Resolve database stored image path to absolute file system path."""
        clean = image_path_or_url.replace("/uploads/", "").lstrip("/\\")
        return settings.UPLOAD_DIR / clean
