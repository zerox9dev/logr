# Template: REST API / Backend Service

Use this template when building a standalone API, microservice, or backend.

## Stack Options

### Option A: Node.js (TypeScript)

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js 22+ or Bun | Fast, huge ecosystem |
| Framework | Hono | Lightweight, edge-ready, typed routes, 14KB |
| Language | TypeScript 5.x | Type safety |
| Validation | Zod | Runtime type validation, OpenAPI generation |
| Database | PostgreSQL via Drizzle ORM | Type-safe, lightweight ORM |
| Auth | JWT + middleware or Better Auth | Stateless, scalable |
| Docs | Scalar or Swagger UI | Auto-generated from Zod schemas |
| Testing | Vitest | Fast, native ESM support |
| Deploy | Railway, Fly.io, or Docker on VPS | Easy container deploys |

### Option B: Python

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | FastAPI | Async, auto-docs, type hints, fastest Python framework |
| Language | Python 3.12+ | Type hints, async/await |
| Validation | Pydantic v2 | Automatic from type hints |
| Database | PostgreSQL via SQLAlchemy 2.0 | Async ORM, mature |
| Auth | FastAPI-Users or custom JWT | Pluggable auth |
| Docs | Built-in Swagger + ReDoc | Free with FastAPI |
| Testing | pytest + httpx | Standard Python testing |
| Deploy | Docker on Railway, Fly.io, or VPS | Container deploys |

## Project Structure (Node.js/Hono)

```
src/
├── routes/
│   ├── auth.ts            # Auth endpoints
│   ├── users.ts           # User CRUD
│   └── [resource].ts      # Resource routes
├── middleware/
│   ├── auth.ts            # JWT verification
│   ├── cors.ts            # CORS config
│   └── rateLimit.ts       # Rate limiting
├── db/
│   ├── schema.ts          # Drizzle schema
│   └── migrations/        # SQL migrations
├── lib/
│   ├── errors.ts          # Error types
│   └── validators.ts      # Zod schemas
├── index.ts               # App entry point
└── tests/                 # API tests
```

## Key Patterns

- **Input validation on every endpoint** — never trust the client
- **Consistent error format** — `{ error: string, code: string, details?: any }`
- **Rate limiting** — per IP and per user
- **Pagination** — cursor-based for lists, not offset
- **Versioning** — `/v1/` prefix from day one
- **Health check** — `GET /health` returns `{ status: "ok", version: "1.0.0" }`
- **Structured logging** — JSON logs, not console.log

## Agents should know:

- PM: API = clear endpoints, request/response schemas, error codes
- Designer: Not applicable (skip Designer for API-only tasks)
- Engineer: Validate all input, handle errors, write typed schemas
- QA: Test happy path, validation errors, auth failures, rate limits
