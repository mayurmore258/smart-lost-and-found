# Smart AI Lost & Found — Agent Workflow

## 1. Agent Role
The agent coordinates the lost-and-found workflow. CLIP and Gemini are tools used by the agent; neither is the complete agent by itself.

## 2. Tools
### Tool 1 — Item Database
Retrieves active lost/found reports and metadata.

### Tool 2 — CLIP Matcher
Converts images into embeddings and retrieves visually similar items.

### Tool 3 — Gemini Reasoner
Examines shortlisted candidates and explains whether the evidence supports a potential match.

### Tool 4 — Verification
Collects additional information from the user when visual evidence is insufficient.

### Tool 5 — Notification/Connection
Triggers the permitted next step after verification.

## 3. Agent Loop

```text
Receive report
     ↓
Understand item + context
     ↓
Search candidates with CLIP
     ↓
Evaluate candidates with Gemini
     ↓
Decide next action
     ├── No useful match → inform user
     ├── Uncertain → ask verification question
     └── Potential match → verification
                              ↓
                         verified?
                       ├── No → close/review
                       └── Yes → connect/notify
```

## 4. Gemini Reasoning Inputs
Gemini should consider:
- Overall appearance
- Color
- Shape
- Brand/logo
- Patterns
- Accessories
- Distinctive marks
- Visible damage
- User-provided description
- Relevant location/time context

## 5. Safety and Reliability
- Do not claim certainty from visual similarity alone.
- Treat similarity as evidence, not proof of ownership.
- Use verification before connecting users.
- Provide an uncertain/manual-review path.
- Avoid exposing private contact information unnecessarily.

## 6. Example
A user reports a black backpack. CLIP retrieves five visually similar found reports. Gemini identifies that one candidate shares the same brand logo, red keychain, and distinctive scratch. The agent asks the owner to provide a private identifying detail. If the response supports the match, the agent moves the case to the permitted connection/recovery step.
