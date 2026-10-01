# Smart AI Lost & Found — Tech Stack

## Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Component library as required by the existing UI

## Backend
- Python
- FastAPI
- Uvicorn

## Computer Vision
- OpenAI CLIP, preferably ViT-B/32 for the MVP
- CLIP runs locally and generates image embeddings
- Cosine similarity for initial matching

## AI Reasoning
- Gemini API
- Gemini is used after CLIP retrieval to reason about shortlisted candidates

## Database
Use the team's selected database for:
- Users
- Lost reports
- Found reports
- Match records
- Verification state

## Image Storage
Store uploaded images using the selected object/image storage solution and keep references in the database.

## Optional Similarity Search
- MVP: cosine similarity over stored embeddings
- Larger dataset: FAISS or another vector-search solution

## Deployment
- Frontend: existing preferred frontend hosting
- Backend: existing preferred Python/FastAPI hosting
- Database/image storage: selected managed service

## Environment Variables
- GEMINI_API_KEY
- DATABASE_URL
- IMAGE_STORAGE credentials/configuration
- Frontend API base URL

## Design Principle
Use CLIP for fast candidate retrieval and Gemini for reasoning. Do not send every database image to Gemini.
