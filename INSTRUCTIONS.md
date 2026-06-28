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

## Frontend Architecture

The frontend is a **Vite single-page application (SPA)**. This has important consequences:

- **`frontend/index.html` is the SPA shell only** — it should contain only standard HTML boilerplate (metadata, title, favicon), the `#root` mount point, and the `<script type="module">` tag. Do not add UI, static footers, or stylesheet links here.
- **All UI lives in React components under `frontend/src/`** — pages go in `src/pages/`, reusable pieces in `src/components/`.
- **Routing is handled by React Router** — there are no `.html` files per page. New views need a `<Route>` in `App.tsx`, not a new HTML file. Use path-based routing (e.g., `/game`) and never link to `.html` files.
- **Styling is Tailwind CSS only** — do not create separate `.css` files for components. CSS files placed outside `src/` (e.g. `frontend/css/`) are not processed by Vite/Tailwind and will be dead code. Use Tailwind utility classes in JSX.
- **Component library** — lucide-react for icons, shadcn/ui conventions for primitives. Check existing components before installing new packages.

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
npm run dev
```

## Agile Discipline

This team practices agile closely. Every PR should trace back to an issue (user story, bug, or task).

**Before writing any code**, check whether a corresponding issue exists:
- Search open issues for the feature or fix you're about to implement
- If one exists, read the acceptance criteria and treat them as the definition of done
- If none exists, flag it — don't just proceed without a ticket

**Scope your changes to the issue.** If the issue says "add a footer link," the PR should touch the footer — not introduce new pages, refactor unrelated components, or bundle in other improvements. Ask yourself: "Would the reviewer expect this file to be in this PR?" If not, it probably shouldn't be.

**Keep the diff minimal.** Prefer fewer files changed with clear intent over a large diff that mixes concerns. A PR that exactly satisfies the acceptance criteria and nothing more is the goal.

**When helping a contributor with AI assistance**, a good first step is to ask which issue they're working on (or scan open issues for a match), then use the acceptance criteria to guide and constrain the implementation.

## PR Expectations

- Descriptive PR title (imperative mood: "Add login page", not "Added login page")
- Summary of what changed and why
- Self-review before requesting human review
- Link related issues in the PR description using Closes #XX (not in comments) so GitHub auto-closes them on merge
