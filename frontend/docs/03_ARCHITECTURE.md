# Smart AI Lost & Found — System Architecture

## 1. High-Level Architecture

```text
                ┌──────────────────┐
                │ React Frontend   │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ FastAPI Backend  │
                └────────┬─────────┘
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
      ┌──────────────┐        ┌──────────────┐
      │   Database   │        │ Image Store  │
      └──────────────┘        └──────────────┘
             │
             ▼
      ┌──────────────┐
      │ CLIP Model   │
      │ Embeddings   │
      └──────┬───────┘
             ▼
      Similarity Search
             │
       Top Candidates
             ▼
      ┌──────────────┐
      │ Gemini       │
      │ Reasoning    │
      └──────┬───────┘
             ▼
      Verification / Action
```

## 2. Lost Item Flow
1. User uploads a lost-item image and details.
2. Backend validates and stores the report.
3. CLIP creates an embedding.
4. Backend searches found-item embeddings.
5. Top candidates are selected.
6. Gemini compares the lost image with shortlisted candidates.
7. Agent determines the next step.
8. Frontend displays the result and verification action.

## 3. Found Item Flow
1. Finder uploads an image and details.
2. Backend stores the report.
3. CLIP generates an embedding.
4. The report becomes searchable for future lost-item reports.

## 4. Agent Decision Flow

```text
Candidate search
      ↓
Enough useful candidates?
  ├── No → No useful match
  └── Yes
        ↓
Gemini reasoning
        ↓
Strong evidence?
  ├── Yes → Verification
  ├── Uncertain → Ask for more information
  └── No → No match
```

## 5. Main Components
- Frontend UI
- FastAPI API layer
- Item/report service
- Image processing service
- CLIP embedding service
- Similarity search service
- Gemini reasoning service
- Verification/match service
- Database
- Image storage
