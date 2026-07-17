# backend

Two independent, currently-inactive subprojects. Neither is part of the running app — the frontend talks to Supabase directly (see the [root README](../README.md#tech-stack)). Both are kept around for local experimentation / possible future use.

## `node/`

Legacy Express API that predates the Supabase RPCs. Superseded, but functionally complete — every route below still works if you stand it up locally (see the root README's commented-out "legacy Express backend" setup step).

- `src/index.js` — server entry point
- `src/routes/words.js` — routes:
  - `GET /api/health` — liveness check
  - `GET /api/word/random?length=` — random answer word of the given length
  - `GET /api/word/hourly?length=` — word shared by all callers within the same UTC hour
  - `GET /api/word/daily?length=&utcOffsetSeconds=` — word shared by all callers within the same local calendar day
- `src/db/pool.js` — Postgres connection pool
- `src/db/seed.js` — loads `db/words/` word lists into the `words` table
- `db/schema.sql` — table schema
- `db/words/` — source word lists (the frontend's `frontend/src/data/answers-5.ts` / `valid-guesses-5.ts` are generated from these — do not hand-edit those generated files)

## `python/`

Reserved for utility scripts (e.g. word-list processing), not an API. Currently just a `src/main.py` stub.
