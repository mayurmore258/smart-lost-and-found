# Smart AI Lost & Found — Product Requirements Document

## 1. Product Overview
Smart AI Lost & Found is an AI-powered agent that helps people in Bharat recover lost belongings by connecting lost-item reports with found-item reports using image understanding, similarity search, AI reasoning, and verification.

## 2. Problem
People frequently lose belongings in crowded places such as railway stations, metro stations, buses, colleges, airports, malls, and public events. Existing processes are fragmented and depend on manual searching through posts, descriptions, or community groups. A lost item and its corresponding found item may exist, but the owner and finder may never discover each other.

## 3. Target Users
- People reporting a lost item
- People reporting a found item
- Institutions/venues managing lost-and-found reports

## 4. Product Goal
Reduce the manual effort and time required to identify potential lost-and-found matches and guide users through a safer verification process.

## 5. MVP Features
- Report a lost item with image and details
- Report a found item with image and details
- Store item reports
- Generate image embeddings using CLIP
- Search for visually similar items
- Use Gemini to reason over top candidates
- Display potential matches
- Ask verification questions when necessary
- Update match/report status

## 6. User Flow
Report item → Image processing → Similarity search → Candidate retrieval → AI reasoning → Verification → Potential match / no match / manual review

## 7. Functional Requirements
- The system must accept item images.
- The system must store basic item metadata.
- The system must generate and compare visual embeddings.
- The system must return ranked potential matches.
- Gemini must receive only shortlisted candidates.
- The agent must handle uncertain matches.
- Users must be able to see the status of their report.

## 8. Non-Functional Requirements
- Responsive UI
- Reasonable response time
- Secure API keys
- Input validation
- Clear error handling
- Privacy-conscious handling of uploaded images

## 9. Out of Scope for MVP
- Guaranteed identity verification
- Automatic physical handover
- Government/railway integration
- Large-scale nationwide deployment
- Automated legal decisions

## 10. Success Criteria
A complete demo should show a lost-item image being matched against found-item reports and the agent producing an explainable next action.
