# 🔎 Smart AI Lost & Found — Backend API

An intelligent, multi-provider AI backend designed to match lost and found items using local CLIP visual embeddings and LLM reasoning.

> **Note**: Frontend is handled separately by the frontend team. This repository directory contains only backend services and AI logic.

---

## 🏗 Architecture & Flow

```text
[Client / Frontend]
        │
        ▼ (Multipart Upload)
  POST /api/items/lost or found
        │
        ├──▶ Store Image Locally (/uploads/)
        │
        └──▶ Generate CLIP Visual Embedding (ViT-B/32, normalized 512-dim)
             Stored in Database (SQLite / PostgreSQL)

When matching is triggered:
  POST /api/items/{item_id}/match
        │
        ▼
  Cosine Similarity Search (LOST vs FOUND items only)
        │
        ▼
  Shortlist Top Candidates (Top-K, default K=5)
        │
        ▼
  LLM Reasoning (Capability-Aware Two-Level Fallback)
        │
        ▼
  Agent Decision (potential_match / uncertain / no_match)
        │
        ▼
  Generate Verification Question & Register Match
        │
  POST /api/matches/{match_id}/verify ──▶ Confirmed / Rejected
```

---

## 🧠 AI Provider Architecture & Two-Level Fallback

### Ordered Fallback Sequence:
1. **Groq** (`llama-3.2-11b-vision-preview`, `llama-3.2-90b-vision-preview`, `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`)
2. **Cohere** (`command-r-plus`, `command-r`, `command-light`) *(Text reasoning only; skipped if vision required)*
3. **SambaNova** (`Llama-3.2-11B-Vision-Instruct`, `Llama-3.2-90B-Vision-Instruct`, `Meta-Llama-3.1-70B-Instruct`)
4. **OpenRouter** (`openrouter/free`)
5. **Gemini** (`gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash-exp`)

### Two-Level Fallback Strategy:
- **Level 1**: Within the active provider, cycle through compatible free models.
- **Level 2**: If all models fail in that provider, proceed to the next provider in the strict sequence above.
- **Quota Saver**: Execution stops immediately upon the first successful model response.
- **Capability-Aware Selection**: If vision reasoning is required, text-only models and providers are automatically bypassed.

### CLIP Role:
- Local OpenAI CLIP (`ViT-B/32`) extracts normalized 512-dimensional embeddings from uploaded images.
- Candidate retrieval calculates cosine similarity strictly between LOST and FOUND items.
- Only the top shortlisted candidates are forwarded to LLM reasoning (preventing database-wide LLM token exhaustion).

### LLM Role:
- Reasons over shortlisted candidates comparing visual characteristics, color, brand, condition, location, and timestamps.
- Formulates non-obvious verification questions for candidate confirmation without exposing private details.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` inside `backend/`:

```env
GROQ_API_KEY=your_groq_key
COHERE_API_KEY=your_cohere_key
SAMBANOVA_API_KEY=your_sambanova_key
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key

DATABASE_URL=sqlite:///./lost_and_found.db

SUPABASE_URL=
SUPABASE_KEY=

CLIP_MODEL=ViT-B/32
```

> **Important**: Real API keys are required for live cloud AI reasoning. When no keys are configured or during local development/offline testing, the backend seamlessly falls back to a deterministic local reasoning engine without throwing unhandled exceptions.

---

## 🚀 Installation & Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI backend server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. **Interactive Documentation**:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

---

## 📡 API Endpoints

### 1. Health
- `GET /api/health` — Service health check.

### 2. Items
- `POST /api/items/lost` — Multipart upload to report lost item (image, description, category, color, location, date_time, optional brand).
- `POST /api/items/found` — Multipart upload to report found item.
- `GET /api/items/{item_id}` — Retrieve item details.
- `POST /api/items/{item_id}/match` — Run CLIP retrieval and LLM reasoning against found candidates.
- `PATCH /api/items/{item_id}/status` — Update item status (`active`, `potential_match`, `verified`, `resolved`, `closed`).

### 3. Matches & Verification
- `GET /api/matches/{item_id}` — Get all candidate matches for a lost item.
- `GET /api/matches/{match_id}/verification-question` — Retrieve question for verification.
- `POST /api/matches/{match_id}/verify` — Submit answer to verify item ownership (`{"answer": "..."}`).

---

## 🛡 Standard Error Format

All error responses strictly adhere to:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description"
  }
}
```
Supported codes include `INVALID_IMAGE`, `INVALID_STATUS`, `ITEM_NOT_FOUND`, `MATCH_NOT_FOUND`, `AI_PROVIDER_UNAVAILABLE`, `AI_STAGE_FAILED`, and `VALIDATION_ERROR`.
