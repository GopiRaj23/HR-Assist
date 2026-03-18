# HR Assist - Project Intelligence

## Project Overview
HR Assist is an AI-powered interview analysis tool that accepts Zoom interview recordings,
transcribes them, segments Q&A pairs, analyzes candidate answers, and generates structured reports.

**Tech Stack (MVP):**
- Backend: Node.js + Express + TypeScript
- AI: OpenAI Whisper (transcription) + GPT-4o (analysis)
- Storage: In-memory (Map-based, no database for MVP)
- API: REST (versioned at /api/v1)
- File Upload: Multer

## Directory Structure
```
src/
  index.ts              # Express server entry point
  config/               # Environment configuration
  types/                # TypeScript interfaces
  storage/              # In-memory report storage
  middleware/            # Upload (multer) and error handling
  transcription/        # OpenAI Whisper integration
  ai/                   # Q&A segmentation and GPT analysis
  report/               # Report generation
  services/             # Pipeline orchestration
  controllers/          # Request handlers
  routes/               # Route definitions
docs/                   # Architecture, decisions, API contracts
scripts/                # Automation scripts
uploads/                # Temporary audio files (gitignored)
```

## Engineering Guardrails

### Code Modification Rules
1. Always use the latest commit as baseline; NEVER regenerate files from scratch
2. Preserve existing logic that represents previous bug fixes unless the root cause is fully addressed
3. Fix root causes, NOT symptoms — check the entire repository for duplicate logic
4. Minimal-change policy: modify ONLY necessary lines; do NOT rewrite entire files unless justified
5. New changes must NOT reintroduce previously fixed bugs or break existing behavior
6. Before generating code, briefly explain: (a) what is being changed, (b) why it is safe, (c) why it will NOT cause regressions
7. If defensive/safety logic exists, DO NOT remove it — retain it and add comment: "CRITICAL SAFEGUARD"

### Code Quality
- Production-grade code only
- Include error handling at system boundaries
- Modular and maintainable design
- Avoid tight coupling
- All new endpoints require input validation
- API changes must update docs/api_contracts.md

### Commands
- Dev server: `npm run dev`
- Build: `npm run build`
- Start (prod): `npm start`
- Validation: `bash scripts/post_task.sh`

## Workflow

### Before Any Task
1. Read this file and docs/architecture.md
2. Run `git status` to understand current state
3. Check docs/decisions.md for relevant past decisions
4. Review the Learnings Log and Mistakes sections below
5. Explain how your approach avoids past mistakes

### During Task
- Follow existing code patterns and conventions
- Write types first, implementation second
- Add tests alongside new code
- Respect the architecture defined in docs/architecture.md
- Follow guardrails strictly

### After Task
1. Run validation: `bash scripts/post_task.sh`
2. Self-review: What mistakes were made? What could break? What is not scalable?
3. Update this file's Learnings/Mistakes sections if applicable
4. Update docs/ if architecture or API contracts changed

## Learnings Log
<!-- Format: YYYY-MM-DD | Category | Learning -->
<!-- Append new entries below this line -->

## Mistakes to Avoid
<!-- Format: YYYY-MM-DD | What happened | How to prevent -->
<!-- Append new entries below this line -->
