# API Contracts

## Base URL
```
/api/v1
```

## Response Format

All responses follow this structure:

```json
{
  "data": {},
  "error": null,
  "meta": {
    "timestamp": "2026-03-18T12:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": []
  },
  "meta": {
    "timestamp": "2026-03-18T12:00:00.000Z"
  }
}
```

## Conventions
- **Pagination:** `?page=1&limit=20` — response includes `meta.pagination: { page, limit, total, totalPages }`
- **Dates:** ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **IDs:** UUIDs
- **HTTP Status Codes:** 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)

---

## Interview Analysis (MVP — Active)

### Upload Audio
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload-audio` | Upload interview recording, triggers async analysis pipeline |

**Request:** `multipart/form-data` with field `audio` (max 100MB, audio formats: mp3, mp4, m4a, wav, webm, ogg, flac)

**Response (202):**
```json
{
  "data": { "id": "uuid", "status": "processing" },
  "error": null,
  "meta": { "timestamp": "..." }
}
```

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports` | List all report summaries |
| GET | `/reports/:id` | Get full interview report |

**Report object:**
```json
{
  "id": "uuid",
  "fileName": "interview.mp3",
  "uploadedAt": "ISO 8601",
  "status": "processing | completed | failed",
  "overallScore": 7.5,
  "summary": "Executive summary...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendation": "Hire — ...",
  "questionAnalyses": [
    {
      "questionNumber": 1,
      "question": "...",
      "answerSummary": "...",
      "relevanceScore": 8,
      "clarityScore": 7,
      "confidenceScore": 6,
      "strengths": ["..."],
      "weaknesses": ["..."]
    }
  ],
  "transcript": [
    { "speaker": "Speaker 1", "text": "...", "start": 0.0, "end": 5.2 }
  ]
}
```

---

## Future Endpoints (Not Yet Implemented)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with credentials |
| POST | `/auth/register` | Register new user |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | List employees (paginated) |
| GET | `/employees/:id` | Get employee by ID |
| POST | `/employees` | Create employee |
| PUT | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Delete employee |

### Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/departments` | List departments |
| GET | `/departments/:id` | Get department by ID |
| POST | `/departments` | Create department |
| PUT | `/departments/:id` | Update department |
| DELETE | `/departments/:id` | Delete department |

---

*Endpoints will be expanded as features are implemented. Update this file whenever API contracts change.*
