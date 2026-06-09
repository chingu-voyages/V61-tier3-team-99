# Repository Instructions for GitHub Copilot

## Project Context

This is a **Chingu Voyage Tier 3 Team 99** project. Chingu is a collaborative learning program where teams build and ship a real app over a multi-week voyage. This repo is in early Sprint 1 — the team is still deciding on the tech stack, project idea, and architecture.

**Before generating code or scaffolding:** check `docs/team_decision_log.md` to see what the team has decided on. Do not assume a language, framework, or hosting provider that hasn't been confirmed there.

## Repository Layout

```
.github/copilot-instructions.md   # This file
docs/team_decision_log.md         # Tech stack and process decisions
docs/team_project_ideas.md        # Project idea voting
README.md                         # Team roster and project overview
INSTRUCTIONS.md                   # Agent instructions (also read by Copilot cloud agent)
```

## Coding Standards

> These will be updated once the stack is finalized. The following are defaults until overridden.

- Prefer **explicit and readable** code over clever or terse code
- Keep functions small and single-purpose
- No commented-out code in commits
- Meaningful variable and function names — avoid abbreviations

## Git & PR Workflow

- Branch from `dev` (not `main`)
- PRs target `dev`
- Branch naming: `type/short-description` — e.g. `feat/user-auth`, `fix/login-redirect`, `chore/update-deps`
- One concern per PR — avoid bundling unrelated changes
- PR titles use imperative mood: "Add X", "Fix Y", "Remove Z"

## Code Review Guidance

When reviewing code in this repo, flag:
- Logic that contradicts decisions recorded in `docs/team_decision_log.md`
- Hardcoded values that should be environment variables
- Missing input validation at system boundaries (user input, API responses)
- Security issues: SQL injection, XSS, exposed credentials, insecure direct object references
- Inconsistency with the patterns already established in the codebase
