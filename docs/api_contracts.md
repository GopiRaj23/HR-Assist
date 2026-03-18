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

## Authentication

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | `/auth/login`         | Login with credentials |
| POST   | `/auth/register`      | Register new user    |
| POST   | `/auth/refresh`       | Refresh access token |
| POST   | `/auth/logout`        | Invalidate refresh token |

## Employees

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/employees`          | List employees (paginated) |
| GET    | `/employees/:id`      | Get employee by ID   |
| POST   | `/employees`          | Create employee      |
| PUT    | `/employees/:id`      | Update employee      |
| DELETE | `/employees/:id`      | Delete employee      |

## Departments

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/departments`        | List departments     |
| GET    | `/departments/:id`    | Get department by ID |
| POST   | `/departments`        | Create department    |
| PUT    | `/departments/:id`    | Update department    |
| DELETE | `/departments/:id`    | Delete department    |

---

*Endpoints will be expanded as features are implemented. Update this file whenever API contracts change.*
