# Smart AI Lost & Found — API Contract

## Base
`/api`

## 1. Create Lost Report
### POST `/items/lost`
Multipart/form-data:
- `image`
- `description`
- `category`
- `color`
- `brand` (optional)
- `location`
- `date_time`

Response:
```json
{
  "item_id": "string",
  "status": "active"
}
```

## 2. Create Found Report
### POST `/items/found`
Multipart/form-data:
- `image`
- `description`
- `category`
- `color`
- `brand` (optional)
- `location`
- `date_time`

Response:
```json
{
  "item_id": "string",
  "status": "active"
}
```

## 3. Find Matches
### POST `/items/{item_id}/match`

Response:
```json
{
  "item_id": "string",
  "status": "completed",
  "matches": [
    {
      "found_item_id": "string",
      "similarity": 0.91,
      "assessment": "potential_match",
      "reasons": [
        "similar color",
        "matching logo",
        "similar distinctive mark"
      ]
    }
  ]
}
```

## 4. Get Matches
### GET `/matches/{item_id}`

Returns the latest potential matches and their current status.

## 5. Verification
### POST `/matches/{match_id}/verify`

Request:
```json
{
  "answer": "string"
}
```

Response:
```json
{
  "match_id": "string",
  "status": "verified"
}
```

## 6. Update Item Status
### PATCH `/items/{item_id}/status`

Request:
```json
{
  "status": "active | potential_match | verified | resolved | closed"
}
```

## 7. Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

## API Rules
- Validate uploaded files.
- Limit image size/type.
- Never expose API keys to the frontend.
- Return predictable response structures.
- Handle AI/provider failures gracefully.
