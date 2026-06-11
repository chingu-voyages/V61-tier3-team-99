# Agent Instructions

This file provides context for AI coding agents working in this repository.

## Project Overview

This is a **Chingu Voyage 61 — Tier 3, Team 99** project.

**App:** A Wordle-style word-guessing game, delivered as a web app.

**Tech Stack:**
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js (Express) — primary API layer
- **Database:** PostgreSQL via [Neon](https://neon.tech) (serverless)
- **Hosting:** Vercel (frontend), Render (backend)
- **Python:** Reserved for utilities/scripts (e.g. word list processing) — lives in `backend/python/`, not serving API endpoints

## Repository Structure

```
.github/                    # GitHub config, workflows, issue templates
docs/                       # Team documents, meeting notes, decision log
frontend/                   # React + Tailwind app
  public/                   # Static assets (index.html, icons, etc.)
  src/
    pages/                  # Page-level components
    components/             # Reusable UI components
    utils/                  # Helper functions and game logic
backend/
  node/                     # Node.js / Express — primary API layer
    src/
      index.js              # Server entry point
  python/                   # Python — utilities and scripts only (not API)
    src/
      main.py               # Entry point for Python utilities
README.md                   # Project readme and team roster
INSTRUCTIONS.md             # This file — agent instructions
```

## Game Concept

Wordle-style: players guess a hidden word in a limited number of attempts. Each guess reveals letter-level feedback (correct position, wrong position, not in word). Details TBD as the team finalizes feature specs.

## Key Rules

- **Branch from `dev`**, not `main`. PRs should target `dev`.
- **Keep PRs focused.** One concern per PR. Don't bundle unrelated changes.
- **Don't modify `docs/`** unless explicitly asked — these are team-owned documents.
- **Check `docs/team_decision_log.md`** for any decisions that override the defaults above.

## Build & Test

### Frontend
```bash
cd frontend
npm ci
npm run dev
```

### Backend (Node)
```bash
cd backend/node
npm ci
node src/index.js
```

## PR Expectations

- Descriptive PR title (imperative mood: "Add login page", not "Added login page")
- Summary of what changed and why
- Self-review before requesting human review
