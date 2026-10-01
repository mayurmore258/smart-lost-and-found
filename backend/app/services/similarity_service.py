import numpy as np
from typing import List, Tuple
from app.database.models import Item
from app.services.clip_service import clip_service
from app.config import settings


class SimilarityService:
    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0

        a = np.array(v1, dtype=np.float32)
        b = np.array(v2, dtype=np.float32)

        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        dot_product = np.dot(a, b)
        similarity = dot_product / (norm_a * norm_b)
        # Clamp to [0.0, 1.0] for normalized cosine similarity on unit vectors
        return float(np.clip(similarity, 0.0, 1.0))

    @classmethod
    def find_top_candidates(
        cls,
        lost_item: Item,
        found_items: List[Item],
        top_k: int = None,
        min_threshold: float = None,
    ) -> List[Tuple[Item, float]]:
        """
        Ranks found items by visual similarity against the lost item.
        LOST -> FOUND comparisons ONLY.
        Returns:
            List of (found_item, similarity_score) sorted descending by similarity.
        """
        if top_k is None:
            top_k = settings.TOP_K_MATCHES
        if min_threshold is None:
            min_threshold = settings.MIN_SIMILARITY_THRESHOLD

        lost_embedding = clip_service.deserialize_embedding(lost_item.embedding)
        if not lost_embedding:
            return []

        ranked_candidates: List[Tuple[Item, float]] = []

        for found_item in found_items:
            # Ensure we ONLY compare against FOUND items
            if found_item.type != "found":
                continue

            found_embedding = clip_service.deserialize_embedding(found_item.embedding)
            if not found_embedding:
                continue

            sim = cls.cosine_similarity(lost_embedding, found_embedding)
            if sim >= min_threshold:
                ranked_candidates.append((found_item, round(sim, 4)))

        # Sort descending by similarity score
        ranked_candidates.sort(key=lambda x: x[1], reverse=True)

        return ranked_candidates[:top_k]


similarity_service = SimilarityService()
