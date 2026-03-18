# System Architecture

## Overview
HR Assist is a full-stack HR management application built with a clear separation between client and server, communicating via a versioned REST API.

## Tech Stack

| Layer      | Technology                  | Rationale                                          |
|------------|-----------------------------|----------------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite | Type safety, fast HMR, large ecosystem            |
| Backend    | Node.js + Express + TypeScript | Shared language with frontend, mature framework  |
| Database   | PostgreSQL + Prisma ORM     | Relational data model fits HR domain, type-safe ORM |
| Auth       | JWT (access + refresh tokens) | Stateless, scalable authentication               |
| Testing    | Vitest (client), Jest (server) | Fast, TypeScript-native test runners             |

## High-Level Components

```
┌─────────────┐     REST API      ┌─────────────────┐     Prisma     ┌────────────┐
│   React UI  │ ◄──────────────► │  Express Server  │ ◄────────────► │ PostgreSQL │
│   (Vite)    │   /api/v1/*       │  (TypeScript)    │                │            │
└─────────────┘                   └─────────────────┘                └────────────┘
```

## Directory Structure

```
HR Assist/
├── src/
│   ├── client/              # React frontend
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client functions
│   │   ├── store/           # State management
│   │   ├── types/           # Frontend-specific types
│   │   └── utils/           # Frontend utilities
│   ├── server/              # Express backend
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Express middleware (auth, validation, error)
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # Business logic
│   │   ├── types/           # Backend-specific types
│   │   └── utils/           # Backend utilities
│   └── shared/              # Shared between client and server
│       ├── types/           # Shared TypeScript interfaces
│       └── constants/       # Shared constants
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── docs/                    # Project documentation
├── scripts/                 # Automation scripts
└── public/                  # Static assets
```

## Design Principles

1. **Separation of concerns**: Client, server, and shared code are isolated
2. **Type safety end-to-end**: TypeScript across the entire stack with shared types
3. **Thin controllers**: Controllers delegate to service layer for business logic
4. **Validation at boundaries**: Input validation on API endpoints, not deep in business logic
5. **Convention over configuration**: Consistent file naming and directory structure

## Data Flow

1. User interacts with React UI
2. Client calls API via service functions (`src/client/services/`)
3. Express router maps request to controller
4. Controller validates input, calls service layer
5. Service layer contains business logic, uses Prisma for DB access
6. Response flows back through the same chain

## Authentication Flow

1. User submits credentials to `POST /api/v1/auth/login`
2. Server validates credentials, issues JWT access token + refresh token
3. Client stores tokens, attaches access token to API requests via Authorization header
4. Server middleware verifies token on protected routes
5. Refresh token used to obtain new access token when expired
