import json
import logging
import math
import numpy as np
from pathlib import Path
from typing import List, Optional, Union
from PIL import Image

from app.config import settings

logger = logging.getLogger(__name__)


class CLIPService:
    _instance: Optional["CLIPService"] = None
    _model = None
    _preprocess = None
    _device = None
    _is_real_clip_loaded: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CLIPService, cls).__new__(cls)
        return cls._instance

    def _load_model(self):
        """Lazy load OpenAI CLIP model."""
        if self._model is not None or self._is_real_clip_loaded:
            return

        try:
            import torch
            import clip

            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Loading local OpenAI CLIP model '{settings.CLIP_MODEL}' on {device}...")
            model, preprocess = clip.load(settings.CLIP_MODEL, device=device)
            model.eval()

            self._model = model
            self._preprocess = preprocess
            self._device = device
            self._is_real_clip_loaded = True
            logger.info("OpenAI CLIP model loaded successfully.")
        except (ImportError, Exception) as e:
            logger.warning(
                f"Local torch/clip is not available or failed to load: {e}. "
                "Using deterministic local feature extractor fallback for development/testing."
            )
            self._is_real_clip_loaded = False

    def generate_image_embedding(self, image_input: Union[str, Path, Image.Image]) -> List[float]:
        """
        Generates a 512-dimensional normalized embedding vector for an image.
        Uses OpenAI CLIP when torch/clip is available; falls back cleanly to
        deterministic normalized visual feature extraction if dependencies are absent.
        """
        self._load_model()

        # Load PIL Image if path provided
        if isinstance(image_input, (str, Path)):
            pil_image = Image.open(str(image_input)).convert("RGB")
        else:
            pil_image = image_input.convert("RGB")

        if self._is_real_clip_loaded and self._model is not None:
            return self._encode_with_clip(pil_image)
        else:
            return self._encode_with_fallback(pil_image)

    def _encode_with_clip(self, pil_image: Image.Image) -> List[float]:
        """Encode image using local OpenAI CLIP."""
        import torch

        with torch.no_grad():
            image_tensor = self._preprocess(pil_image).unsqueeze(0).to(self._device)
            image_features = self._model.encode_image(image_tensor)
            # Normalize embedding
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            embedding: List[float] = image_features.cpu().numpy().flatten().tolist()
            return embedding

    def _encode_with_fallback(self, pil_image: Image.Image) -> List[float]:
        """
        Controlled deterministic normalized fallback embedding (512-dim).
        Extracts color, spatial grid intensity, and contrast distribution,
        ensuring valid normalized vectors for cosine similarity in offline/test environments.
        """
        # Resize to fixed grid (16x16x2 = 512 features)
        thumb = pil_image.resize((16, 16), Image.Resampling.LANCZOS)
        arr = np.array(thumb, dtype=np.float32) / 255.0  # Shape: (16, 16, 3)

        # Build 512-dimensional feature vector
        # 16*16 = 256 grayscale intensity values
        gray = 0.2989 * arr[:, :, 0] + 0.5870 * arr[:, :, 1] + 0.1140 * arr[:, :, 2]
        gray_flat = gray.flatten()  # 256 features

        # 8*8*4 color block histograms/moments to fill next 256 features
        r_flat = arr[:, :, 0].flatten()[:128]
        g_flat = arr[:, :, 1].flatten()[:64]
        b_flat = arr[:, :, 2].flatten()[:64]

        raw_vec = np.concatenate([gray_flat, r_flat, g_flat, b_flat])  # Length: 512

        # L2 Normalize
        norm = np.linalg.norm(raw_vec)
        if norm > 0:
            norm_vec = raw_vec / norm
        else:
            norm_vec = np.zeros(512, dtype=np.float32)
            norm_vec[0] = 1.0

        return norm_vec.tolist()

    @staticmethod
    def serialize_embedding(embedding: List[float]) -> str:
        """Serializes embedding vector to JSON string for database storage."""
        return json.dumps(embedding)

    @staticmethod
    def deserialize_embedding(embedding_str: Optional[str]) -> Optional[List[float]]:
        """Deserializes embedding JSON string from database."""
        if not embedding_str:
            return None
        try:
            return json.loads(embedding_str)
        except Exception:
            return None


clip_service = CLIPService()
