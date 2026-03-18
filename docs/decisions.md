# Architecture Decision Records

## ADR-001: Tech Stack Selection

- **Date:** 2026-03-18
- **Status:** Accepted
- **Context:** Greenfield HR management application requiring a modern, maintainable, and scalable stack. Team needs type safety, fast development cycles, and a relational data model for HR entities (employees, departments, roles, leave, payroll).
- **Decision:** React 18 + TypeScript + Vite (frontend), Node.js + Express + TypeScript (backend), PostgreSQL + Prisma (database), REST API with versioning.
- **Consequences:**
  - Shared TypeScript across full stack reduces context switching
  - Prisma provides type-safe database access and migration management
  - REST chosen over GraphQL for simplicity — HR CRUD operations map naturally to REST
  - Vite provides fast HMR for frontend development
  - PostgreSQL handles complex relational queries needed for HR reporting

## ADR-002: Monorepo Structure

- **Date:** 2026-03-18
- **Status:** Accepted
- **Context:** Need to share types and constants between frontend and backend without publishing packages.
- **Decision:** Single repository with `src/client`, `src/server`, and `src/shared` directories.
- **Consequences:**
  - Shared types ensure API contract consistency at compile time
  - Simpler deployment and CI/CD pipeline
  - No package publishing overhead
  - Must be careful with imports to avoid bundling server code into client

## ADR-003: JWT Authentication

- **Date:** 2026-03-18
- **Status:** Accepted
- **Context:** Need stateless authentication that scales horizontally.
- **Decision:** JWT with access + refresh token pattern.
- **Consequences:**
  - Stateless — no server-side session storage needed
  - Refresh tokens enable long-lived sessions without long-lived access tokens
  - Token revocation requires additional infrastructure (blacklist) if needed later

## ADR-004: MVP Simplification — Backend-Only with In-Memory Storage

- **Date:** 2026-03-18
- **Status:** Accepted
- **Context:** The MVP needs to demonstrate the core interview analysis pipeline (upload → transcribe → segment → analyze → report) as quickly as possible. Full-stack with PostgreSQL adds complexity without validating the core value proposition.
- **Decision:** MVP is backend-only (no React frontend). Uses in-memory Map storage instead of PostgreSQL. OpenAI Whisper for transcription, GPT-4o for analysis. Audio files uploaded via multipart POST, reports retrieved via GET.
- **Consequences:**
  - Faster time to working prototype
  - Reports are lost on server restart (acceptable for MVP)
  - No authentication (deferred to post-MVP)
  - Frontend can be added later consuming the same REST API
  - Easy to swap in-memory store for PostgreSQL later (same interface)

---

## Template

```
## ADR-XXX: Title

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX
- **Context:** What is the issue that we're seeing that motivates this decision?
- **Decision:** What is the change that we're proposing and/or doing?
- **Consequences:** What becomes easier or more difficult to do because of this change?
```
