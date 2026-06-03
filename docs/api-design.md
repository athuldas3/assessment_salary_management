# API Design

## Overview

This document defines the REST API contract between the React frontend and FastAPI backend. All endpoints return JSON, use consistent error shapes, and align with the employee schema in `docs/database-design.md`.

Base URL (local development):

```text
http://localhost:8000/api/v1
```

## Conventions

| Topic | Rule |
|---|---|
| Versioning | Prefix all routes with `/api/v1` |
| IDs | UUID strings in path and response bodies |
| Money | Salary returned as decimal strings or numbers with two decimal places |
| Timestamps | ISO 8601 UTC strings |
| Pagination | `page` (1-based) and `page_size` query params |
| Sorting | Whitelisted `sort_by` and `sort_order` query params |
| Errors | Consistent JSON error envelope |
| Auth | None in v1 scope |

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid employee data",
    "details": [
      {
        "field": "salary",
        "message": "Salary must be greater than 0"
      }
    ]
  }
}
```

### Standard Error Codes

| HTTP Status | Code | When |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Invalid request body or query params |
| 404 | `NOT_FOUND` | Employee not found |
| 409 | `CONFLICT` | Database integrity or business conflict |
| 500 | `INTERNAL_ERROR` | Unexpected server failure |

Internal stack traces and database errors are never returned to clients.

## Shared Schemas

### EmployeeResponse

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "full_name": "Jane Doe",
  "country": "United States",
  "job_title": "Software Engineer",
  "department": "Engineering",
  "salary": "95000.00",
  "created_at": "2026-06-03T10:00:00Z",
  "updated_at": "2026-06-03T10:00:00Z"
}
```

### EmployeeCreateRequest

```json
{
  "full_name": "Jane Doe",
  "country": "United States",
  "job_title": "Software Engineer",
  "department": "Engineering",
  "salary": "95000.00"
}
```

### EmployeeUpdateRequest

Same fields as create request. All fields required on update for simplicity and predictable HR edits.

### PaginatedEmployeeResponse

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total_items": 10000,
  "total_pages": 500
}
```

## Health

### `GET /health`

Simple readiness endpoint for local development and deployment checks.

**Response 200**

```json
{
  "status": "ok"
}
```

## Employee Endpoints

### `GET /employees`

List employees with pagination, filtering, and sorting.

**Query parameters**

| Param | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | integer | No | `1` | Page number, minimum 1 |
| `page_size` | integer | No | `20` | Items per page, max 100 |
| `country` | string | No | — | Exact country filter |
| `job_title` | string | No | — | Exact job title filter |
| `department` | string | No | — | Exact department filter |
| `search` | string | No | — | Case-insensitive match on `full_name` |
| `sort_by` | string | No | `full_name` | One of: `full_name`, `country`, `job_title`, `department`, `salary`, `created_at`, `updated_at` |
| `sort_order` | string | No | `asc` | `asc` or `desc` |

**Response 200**

Returns `PaginatedEmployeeResponse`.

**Example**

```http
GET /api/v1/employees?page=1&page_size=20&country=United%20States&job_title=Software%20Engineer&sort_by=salary&sort_order=desc
```

**Notes**

- Filtering and sorting happen in SQL.
- `total_items` and `total_pages` come from a separate count query.
- This endpoint powers the employee table UI.

---

### `GET /employees/{employee_id}`

Fetch a single employee by UUID.

**Response 200**

Returns `EmployeeResponse`.

**Response 404**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found"
  }
}
```

**Notes**

- Used by edit forms to load current values.

---

### `POST /employees`

Create a new employee.

**Request body**

`EmployeeCreateRequest`

**Validation**

| Field | Rules |
|---|---|
| `full_name` | Required, 1-200 chars |
| `country` | Required, 1-100 chars |
| `job_title` | Required, 1-150 chars |
| `department` | Required, 1-150 chars |
| `salary` | Required, decimal > 0 |

**Response 201**

Returns created `EmployeeResponse`.

**Response 422**

Validation failure.

**Notes**

- Wrapped in a transaction.
- Server sets `id`, `created_at`, and `updated_at`.

---

### `PUT /employees/{employee_id}`

Update an existing employee.

**Request body**

`EmployeeUpdateRequest`

**Response 200**

Returns updated `EmployeeResponse`.

**Response 404**

Employee not found.

**Response 422**

Validation failure.

**Notes**

- Full replacement update keeps frontend and tests simple.
- `updated_at` refreshed on successful update.

---

### `DELETE /employees/{employee_id}`

Delete an employee record.

**Response 204**

No response body.

**Response 404**

Employee not found.

**Notes**

- Hard delete is acceptable for assessment scope.
- Wrapped in a transaction.

---

### `GET /employees/metadata/filters`

Return distinct filter values for UI dropdowns.

**Response 200**

```json
{
  "countries": ["Germany", "India", "United Kingdom", "United States"],
  "job_titles": ["HR Manager", "Product Manager", "Software Engineer"],
  "departments": ["Engineering", "Finance", "HR", "Product"]
}
```

**Notes**

- Uses `SELECT DISTINCT` queries.
- Keeps frontend filter controls in sync with seeded data.
- Small result set, safe to cache in React Query.

## Salary Insight Endpoints

All insight endpoints use SQL aggregate functions and return display-ready rounded values.

### `GET /insights/by-country`

Country-level compensation summary.

**Response 200**

```json
{
  "items": [
    {
      "country": "United States",
      "min_salary": "65000.00",
      "max_salary": "180000.00",
      "avg_salary": "102500.50",
      "employee_count": 2500,
      "salary_range": "65000.00 - 180000.00"
    }
  ]
}
```

**Notes**

- One SQL query with `GROUP BY country`.
- Powers the main country insights section of the dashboard.

---

### `GET /insights/by-department`

Average salary and employee count by department.

**Response 200**

```json
{
  "items": [
    {
      "department": "Engineering",
      "avg_salary": "98000.25",
      "employee_count": 3200
    }
  ]
}
```

---

### `GET /insights/by-job-title`

Average salary and employee count by job title.

**Response 200**

```json
{
  "items": [
    {
      "job_title": "Software Engineer",
      "avg_salary": "96000.00",
      "employee_count": 1800
    }
  ]
}
```

---

### `GET /insights/country-job-title`

Average salary for a specific job title within a country.

**Query parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `country` | string | Yes | Country to analyze |
| `job_title` | string | Yes | Job title to analyze |

**Response 200**

```json
{
  "country": "United States",
  "job_title": "Software Engineer",
  "avg_salary": "105000.00",
  "employee_count": 450
}
```

**Response 422**

Missing or invalid query params.

**Notes**

- Uses indexed filter path on `(country, job_title)`.
- Returns zero-count result with `null` average only if no rows match; otherwise compute from matching employees.

## Endpoint Summary

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service health check |
| GET | `/employees` | Paginated employee list |
| GET | `/employees/{employee_id}` | Get one employee |
| POST | `/employees` | Create employee |
| PUT | `/employees/{employee_id}` | Update employee |
| DELETE | `/employees/{employee_id}` | Delete employee |
| GET | `/employees/metadata/filters` | Distinct filter values |
| GET | `/insights/by-country` | Country salary insights |
| GET | `/insights/by-department` | Department averages |
| GET | `/insights/by-job-title` | Job title averages |
| GET | `/insights/country-job-title` | Job title average in country |

## Frontend Mapping

| UI Feature | API |
|---|---|
| Employee table | `GET /employees` |
| Country filter dropdown | `GET /employees/metadata/filters` |
| Job title filter dropdown | `GET /employees/metadata/filters` |
| Add employee form | `POST /employees` |
| Edit employee form | `GET /employees/{id}` + `PUT /employees/{id}` |
| Delete confirmation | `DELETE /employees/{id}` |
| Insights dashboard cards/tables | `/insights/*` endpoints |

## Validation And Business Rules

- Salary must be a positive decimal.
- String fields must respect max lengths from the database schema.
- Unknown `sort_by` values are rejected with 422.
- `page_size` above 100 is rejected with 422.
- Repository/service layer owns query construction; routes only validate and delegate.

## CORS

The backend will allow the local Vite frontend origin during development, for example:

```text
http://localhost:5173
```

Production allowed origins are configured with the `CORS_ORIGINS` environment variable. See [deployment.md](./deployment.md).

## OpenAPI

FastAPI will auto-generate OpenAPI docs at:

```text
http://localhost:8000/docs
```

This supports manual verification during backend implementation and assessment review.

For copy-paste curl commands covering every endpoint, see [api-curl-examples.md](./api-curl-examples.md).

## Deliberately Excluded Endpoints

| Endpoint | Reason |
|---|---|
| Auth/login/logout | Out of scope for v1 |
| Bulk import/export | Out of scope |
| Payroll runs | Out of scope |
| PATCH partial updates | PUT keeps API simpler for this assessment |
| GraphQL | REST is sufficient and easier to test/document |

## Verification For This Step

- Every required UI feature maps to a documented endpoint.
- Request and response shapes are defined clearly enough to implement backend schemas and frontend hooks.
- Pagination, filtering, sorting, and insights align with database design.
- Error handling conventions match architecture notes.
- No backend or frontend code has been added yet.

## Proposed Commit Message

`docs: add API design and endpoint definitions`
