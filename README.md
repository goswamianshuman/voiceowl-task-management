# Task Manager REST API

A production-quality REST API built with Node.js, TypeScript, Express, and MongoDB.

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

---

## Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Edit .env and set your MONGO_URI

# 3. Start in development mode (with auto-reload)
npm run dev

# 4. Or build and start in production
npm run build
npm start
```

---

## API Documentation

### Swagger UI (interactive)
Once the server is running, open:
```
http://localhost:3000/api-docs
```
You can explore every endpoint, see request/response schemas, and execute requests directly from the browser.

### Raw OpenAPI JSON
```
http://localhost:3000/api-docs.json
```
Use this URL to import the spec into Postman, Insomnia, or any OpenAPI-compatible tool.

### api.http (VS Code REST Client)
The file [`api.http`](./api.http) contains ready-to-run requests for every endpoint, including edge cases and error scenarios.

Install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client), open `api.http`, and click **Send Request** above any request block.

---

## Environment Variables

| Variable    | Description               | Default       |
|-------------|---------------------------|---------------|
| `MONGO_URI` | MongoDB connection string  | (required)    |
| `PORT`      | HTTP port                  | `3000`        |
| `NODE_ENV`  | Environment name           | `development` |

---

## API Endpoints

Base URL: `http://localhost:3000/api/tasks`

| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| POST   | `/api/tasks`      | Create a new task                  |
| GET    | `/api/tasks`      | List tasks (filters + pagination)  |
| GET    | `/api/tasks/stats`| Aggregate statistics               |
| GET    | `/api/tasks/:id`  | Get a single task                  |
| PATCH  | `/api/tasks/:id`  | Update a task                      |
| DELETE | `/api/tasks/:id`  | Delete a task                      |

---

### POST /api/tasks — Create a task

**Request:**
```json
{
  "title": "Fix login bug",
  "description": "Users can't log in with Google OAuth",
  "status": "todo",
  "priority": "high",
  "dueDate": "2027-12-31",
  "tags": ["backend", "auth"]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "title": "Fix login bug",
    "status": "todo",
    "priority": "high",
    "dueDate": "2027-12-31T00:00:00.000Z",
    "tags": ["backend", "auth"],
    "createdAt": "2024-06-04T12:00:00.000Z",
    "updatedAt": "2024-06-04T12:00:00.000Z"
  }
}
```

**Validation rules:**
- `title` — required, string, 3–100 characters
- `status` — optional, one of `todo` | `in-progress` | `done` (default: `todo`)
- `priority` — optional, one of `low` | `medium` | `high` (default: `medium`)
- `dueDate` — optional, must be a valid future date
- `tags` — optional, array of strings

---

### GET /api/tasks — List tasks

All query parameters are optional and fully combinable.

| Parameter   | Example                    | Description                              |
|-------------|----------------------------|------------------------------------------|
| `status`    | `?status=todo`             | Filter by status                         |
| `priority`  | `?priority=high`           | Filter by priority                       |
| `tags`      | `?tags=backend,auth`       | Comma-separated; matches any tag         |
| `dueBefore` | `?dueBefore=2027-12-31`    | Tasks due on or before this date         |
| `sortBy`    | `?sortBy=dueDate`          | Field to sort by (default: `createdAt`)  |
| `order`     | `?order=asc`               | `asc` or `desc` (default: `desc`)        |
| `page`      | `?page=2`                  | Page number (default: 1)                 |
| `limit`     | `?limit=5`                 | Results per page (default: 10, max: 100) |

**Example:** `GET /api/tasks?status=todo&priority=high&sortBy=dueDate&order=asc&page=1&limit=5`

**Response 200:**
```json
{
  "success": true,
  "data": { "tasks": [...] },
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 5,
    "totalPages": 9,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET /api/tasks/stats — Aggregate statistics

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "byStatus": { "todo": 18, "in-progress": 12, "done": 12 },
    "byPriority": { "low": 10, "medium": 22, "high": 10 },
    "overdue": 5
  }
}
```

---

### GET /api/tasks/:id — Get a single task

**Response 200:** Task object (same shape as create response).

**Error 400:** `{ "success": false, "message": "Invalid task ID: xyz" }`

**Error 404:** `{ "success": false, "message": "Task not found" }`

---

### PATCH /api/tasks/:id — Update a task

Send only the fields you want to change. Body must contain at least one field.

**Request:**
```json
{ "status": "in-progress", "priority": "medium" }
```

**Response 200:** Updated task object.

---

### DELETE /api/tasks/:id — Delete a task

**Response 200:**
```json
{ "success": true, "data": { "message": "Task deleted successfully" } }
```

---

## Error Response Format

All errors follow this shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "title must be at least 3 characters",
    "dueDate must be a future date"
  ]
}
```

---

## Indexes

Four indexes are defined on the `tasks` collection:

| Index                   | Field(s)              | Reason                                                                          |
|-------------------------|-----------------------|---------------------------------------------------------------------------------|
| `status_1`              | `status`              | Most common filter — avoids full collection scans on list queries               |
| `priority_1`            | `priority`            | Frequently used filter, often combined with status                              |
| `dueDate_1`             | `dueDate`             | Enables efficient range queries for `dueBefore` filter and overdue stats        |
| `status_1_priority_1`   | `status` + `priority` | Compound index covering the most common multi-filter combination                |

---

## Type Check

```bash
npx tsc --noEmit   # must produce zero errors
```
