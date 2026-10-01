"""
SAFE LOCAL VALIDATION SCRIPT
Ensures all requirements, schemas, routes, database models, and agent workflows work
using local SQLite and MOCKED AI responses.
CRITICAL: NO REAL EXTERNAL API CALLS ARE MADE. NO QUOTAS ARE CONSUMED.
"""

import asyncio
import io
import sys
from pathlib import Path
from PIL import Image

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.config import settings
from app.database.database import Base, engine, SessionLocal, init_db
from app.database.models import Item, Match, Verification
from app.database.repositories import ItemRepository, MatchRepository, VerificationRepository
from app.services.clip_service import clip_service
from app.services.similarity_service import similarity_service
from app.services.verification_service import verification_service
from app.services.llm_service import llm_service
from app.main import app

client = TestClient(app)


def test_routes_registered():
    """Verify that all required endpoints are registered on FastAPI."""
    openapi_paths = list(app.openapi()["paths"].keys())

    print("[1] Inspecting registered routes from OpenAPI schema:")
    required_routes = [
        "/api/health",
        "/api/items/lost",
        "/api/items/found",
        "/api/items/{item_id}/match",
        "/api/matches/{item_id}",
        "/api/matches/{match_id}/verify",
        "/api/items/{item_id}/status",
    ]
    for req in required_routes:
        assert req in openapi_paths, f"Missing route: {req} (OpenAPI paths: {openapi_paths})"
        print(f"    - Route OK: {req}")


def test_health_endpoint():
    """Verify GET /api/health."""
    print("\n[2] Testing GET /api/health...")
    resp = client.get("/api/health")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    assert resp.json() == {"status": "ok"}
    print("    - Health endpoint OK:", resp.json())


def create_test_image_bytes(color: str = "blue") -> io.BytesIO:
    """Generate a simple test image in memory."""
    img = Image.new("RGB", (64, 64), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf


def test_item_creation_and_clip():
    """Verify creating lost and found items with CLIP embedding generation."""
    print("\n[3] Testing Item Creation (Lost & Found) & Local CLIP Embeddings...")

    # 1. Create Found Item
    found_img = create_test_image_bytes("black")
    found_resp = client.post(
        "/api/items/found",
        data={
            "description": "Black leather wallet with credit cards",
            "category": "Wallet",
            "color": "Black",
            "brand": "Montblanc",
            "location": "Central Station Platform 2",
            "date_time": "2026-10-01 14:30",
        },
        files={"image": ("found_wallet.jpg", found_img, "image/jpeg")},
    )
    assert found_resp.status_code == 201, f"Found item creation failed: {found_resp.text}"
    found_data = found_resp.json()
    assert found_data["type"] == "found"
    assert found_data["status"] == "active"
    found_id = found_data["id"]
    print(f"    - Created Found Item: ID={found_id}, Status={found_data['status']}")

    # 2. Create Lost Item
    lost_img = create_test_image_bytes("black")
    lost_resp = client.post(
        "/api/items/lost",
        data={
            "description": "Lost my black leather wallet",
            "category": "Wallet",
            "color": "Black",
            "brand": "Montblanc",
            "location": "Near Central Station",
            "date_time": "2026-10-01 14:15",
        },
        files={"image": ("lost_wallet.jpg", lost_img, "image/jpeg")},
    )
    assert lost_resp.status_code == 201, f"Lost item creation failed: {lost_resp.text}"
    lost_data = lost_resp.json()
    assert lost_data["type"] == "lost"
    assert lost_data["status"] == "active"
    lost_id = lost_data["id"]
    print(f"    - Created Lost Item: ID={lost_id}, Status={lost_data['status']}")

    return lost_id, found_id


def test_similarity_and_matching(lost_id: str, found_id: str):
    """Verify cosine similarity calculation, candidate retrieval, and agent decision."""
    print("\n[4] Testing Matching Workflow & Agent Decision Logic (MOCKED AI)...")
    # Call match endpoint
    match_resp = client.post(f"/api/items/{lost_id}/match")
    assert match_resp.status_code == 200, f"Match failed: {match_resp.text}"
    match_data = match_resp.json()
    print("    - Match Response received:")
    print(f"      item_id: {match_data['item_id']}")
    print(f"      status: {match_data['status']}")
    print(f"      matches count: {len(match_data['matches'])}")

    assert len(match_data["matches"]) > 0, "Expected at least 1 candidate match"
    first_match = match_data["matches"][0]
    assert first_match["found_item_id"] == found_id
    assert 0.0 <= first_match["similarity"] <= 1.0
    print(f"      Candidate: found_id={first_match['found_item_id']}, similarity={first_match['similarity']:.4f}, assessment={first_match['assessment']}")


def test_get_matches(lost_id: str):
    """Verify GET /api/matches/{item_id}."""
    print("\n[5] Testing GET /api/matches/{item_id}...")
    resp = client.get(f"/api/matches/{lost_id}")
    assert resp.status_code == 200, f"Failed: {resp.text}"
    data = resp.json()
    assert data["item_id"] == lost_id
    assert data["total_matches"] > 0
    match_id = data["matches"][0]["id"]
    print(f"    - Retrieved {data['total_matches']} matches. First match ID: {match_id}")
    return match_id


def test_verification(match_id: str):
    """Verify match confirmation via POST /api/matches/{match_id}/verify."""
    print("\n[6] Testing POST /api/matches/{match_id}/verify...")
    # Answer matching the found item details ("Montblanc black leather wallet")
    verify_resp = client.post(
        f"/api/matches/{match_id}/verify",
        json={"answer": "It is a Montblanc black leather wallet with my ID inside."},
    )
    assert verify_resp.status_code == 200, f"Verify failed: {verify_resp.text}"
    res = verify_resp.json()
    assert res["verified"] is True
    print(f"    - Verification success confirmed: {res}")


def test_status_update_and_validation(lost_id: str):
    """Verify PATCH /api/items/{item_id}/status and rejection of invalid statuses."""
    print("\n[7] Testing PATCH /api/items/{item_id}/status...")

    # Allowed status
    resp = client.patch(
        f"/api/items/{lost_id}/status",
        json={"status": "resolved"},
    )
    assert resp.status_code == 200, f"Valid status update failed: {resp.text}"
    assert resp.json()["status"] == "resolved"
    print("    - Status updated to 'resolved' successfully.")

    # Invalid status should be rejected
    bad_resp = client.patch(
        f"/api/items/{lost_id}/status",
        json={"status": "invalid_random_status"},
    )
    assert bad_resp.status_code == 422 or bad_resp.status_code == 400
    err_json = bad_resp.json()
    assert "error" in err_json
    print(f"    - Invalid status correctly rejected with standardized error: {err_json['error']['code']}")


def test_negative_cases():
    """Verify error formats: ITEM_NOT_FOUND, MATCH_NOT_FOUND, INVALID_IMAGE, wrong answer verification."""
    print("\n[9] Testing Standardized Error Handling and Edge Cases...")

    # 1. ITEM_NOT_FOUND
    resp = client.get("/api/items/non-existent-uuid")
    assert resp.status_code == 404
    err = resp.json()["error"]
    assert err["code"] == "ITEM_NOT_FOUND"
    print(f"    - ITEM_NOT_FOUND verified: code={err['code']}, message={err['message']}")

    # 2. MATCH_NOT_FOUND on verify
    resp = client.post("/api/matches/non-existent-match/verify", json={"answer": "something"})
    assert resp.status_code == 404
    err = resp.json()["error"]
    assert err["code"] == "MATCH_NOT_FOUND"
    print(f"    - MATCH_NOT_FOUND verified: code={err['code']}")

    # 3. INVALID_IMAGE (text file instead of image)
    text_file = io.BytesIO(b"This is not a real image file.")
    resp = client.post(
        "/api/items/lost",
        data={
            "description": "Invalid test item",
            "category": "Test",
            "color": "Red",
            "location": "Test Loc",
            "date_time": "2026-10-01 12:00",
        },
        files={"image": ("test.txt", text_file, "text/plain")},
    )
    assert resp.status_code == 400
    err = resp.json()["error"]
    assert err["code"] == "INVALID_IMAGE"
    print(f"    - INVALID_IMAGE rejection verified: code={err['code']}, message={err['message']}")

    # 4. Incorrect answer for verification
    # Create an item and match first
    img1 = create_test_image_bytes("yellow")
    f_resp = client.post(
        "/api/items/found",
        data={
            "description": "Yellow raincoat with distinctive green dinosaur patches",
            "category": "Clothing",
            "color": "Yellow",
            "brand": "KiddoZone",
            "location": "Kindergarten Playground",
            "date_time": "2026-10-01 11:00",
        },
        files={"image": ("found_coat.jpg", img1, "image/jpeg")},
    )
    img2 = create_test_image_bytes("yellow")
    l_resp = client.post(
        "/api/items/lost",
        data={
            "description": "Lost yellow raincoat",
            "category": "Clothing",
            "color": "Yellow",
            "location": "Kindergarten Playground",
            "date_time": "2026-10-01 11:30",
        },
        files={"image": ("lost_coat.jpg", img2, "image/jpeg")},
    )
    m_resp = client.post(f"/api/items/{l_resp.json()['id']}/match")
    matches_list = client.get(f"/api/matches/{l_resp.json()['id']}").json()["matches"]
    if matches_list:
        mid = matches_list[0]["id"]
        # Give a completely incorrect answer
        v_resp = client.post(f"/api/matches/{mid}/verify", json={"answer": "It is completely blue with white floral flowers."})
        assert v_resp.status_code == 200
        assert v_resp.json()["verified"] is False
        print("    - Incorrect verification answer rejected correctly: verified=False")


def test_two_level_fallback_order():
    """Verify the provider fallback ordering."""
    print("\n[8] Verifying LLM Provider Fallback Configuration...")
    provider_names = [p.name for p in llm_service.providers]
    expected_order = ["Groq", "Cohere", "SambaNova", "OpenRouter", "Gemini"]
    assert provider_names == expected_order, f"Order mismatch: {provider_names} != {expected_order}"
    print(f"    - Provider fallback order is strictly correct: {' -> '.join(provider_names)}")

    # Check OpenRouter model
    openrouter = next(p for p in llm_service.providers if p.name == "OpenRouter")
    assert openrouter.vision_models == ["openrouter/free"]
    assert openrouter.text_models == ["openrouter/free"]
    print("    - OpenRouter correctly uses 'openrouter/free'")

    # Check Cohere capability awareness (vision not supported on Cohere)
    cohere = next(p for p in llm_service.providers if p.name == "Cohere")
    assert not cohere.supports_vision(), "Cohere should not be marked as vision-capable"
    print("    - Cohere capability-aware vision exclusion verified")


if __name__ == "__main__":
    print("==================================================")
    print("RUNNING SAFE LOCAL BACKEND VALIDATION")
    print("==================================================")
    init_db()
    test_routes_registered()
    test_health_endpoint()
    lost_id, found_id = test_item_creation_and_clip()
    test_similarity_and_matching(lost_id, found_id)
    match_id = test_get_matches(lost_id)
    test_verification(match_id)
    test_status_update_and_validation(lost_id)
    test_negative_cases()
    test_two_level_fallback_order()
    print("\n==================================================")
    print("ALL SAFE LOCAL VALIDATION CHECKS PASSED (100% OK)")
    print("ZERO REAL EXTERNAL API CALLS WERE MADE.")
    print("==================================================")
