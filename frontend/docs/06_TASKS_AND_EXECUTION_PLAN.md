# Smart AI Lost & Found — Tasks & Execution Plan

## Team Structure

### Person 1 — AI + Backend
Owns:
- FastAPI
- Database integration
- Image upload backend
- CLIP
- Similarity search
- Gemini
- Agent logic
- Verification APIs

### Person 2 — Frontend
Owns:
- React/Vite
- UI screens
- Image upload
- Report forms
- Match results
- Verification UI
- API integration
- Responsive design

## Phase 1 — Setup
### Person 1
- Set up FastAPI project
- Set up database connection
- Define item/match models
- Create basic endpoints

### Person 2
- Set up React/Vite project
- Build landing page
- Build Lost Item form
- Build Found Item form

### Both
- Finalize API contract
- Finalize required fields
- Agree on response formats

## Phase 2 — Core Matching
### Person 1
- Integrate CLIP
- Generate embeddings
- Implement cosine similarity
- Store/retrieve embeddings
- Return top candidates

### Person 2
- Build match-results UI
- Display candidate images/details
- Add loading/error/no-match states
- Use mock API responses until backend is ready

## Phase 3 — Agentic AI
### Person 1
- Integrate Gemini
- Build candidate reasoning prompt
- Implement decision logic
- Add verification flow
- Add status management

### Person 2
- Build verification screen
- Display AI reasoning
- Add verification submission
- Connect all screens to real APIs

## Phase 4 — Integration
### Both
- Connect frontend and backend
- Test complete lost-item flow
- Test found-item flow
- Test matching
- Test no-match cases
- Test uncertain cases
- Fix errors

## Phase 5 — Deployment
### Person 1
- Deploy backend
- Configure Gemini/API environment variables
- Configure database and image storage
- Test production APIs

### Person 2
- Deploy frontend
- Configure production API URL
- Test mobile/desktop UI
- Verify all routes and forms

## Phase 6 — Demo
### Person 1
Demonstrates:
- CLIP retrieval
- Gemini reasoning
- Agent decision
- Verification logic

### Person 2
Demonstrates:
- User reporting a lost item
- Search/results UI
- Verification UI
- Final recovery workflow

## Definition of Done
- User can submit a lost item.
- User can submit a found item.
- Images are processed successfully.
- CLIP returns candidates.
- Gemini reasons over shortlisted candidates.
- Agent handles match/uncertain/no-match outcomes.
- Verification works.
- Frontend and backend work together.
- Production deployment works.
- A complete end-to-end demo can be performed without manual database changes.
