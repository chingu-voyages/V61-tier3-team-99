# Wordle-ish

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Enabled-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

**Wordle-ish** is a Wordle-style word-guessing game, built as a Chingu Voyage 61 (Tier 3, Team 99) collaborative project.

---

## Key Features

- **On-screen virtual keyboard** that updates key states (correct, misplaced, wrong) in real time, matching the board's tile feedback.
- **Sign in with GitHub** and a **leaderboard** tracking games played/won per player, backed by Supabase.

---

## Tech Stack

| Layer                   | Technology                              | Notes                                                                 |
| :---------------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| **Frontend**            | React 19, Vite, Tailwind CSS, React Router | Word game UI and routing                                              |
| **Auth + Leaderboard**  | Supabase (Postgres, Auth, Row Level Security) | GitHub OAuth sign-in, `leaderboard` table + RPC (see `supabase/migrations/`) |
| **Backend (word API)**  | Node.js / Express                        | Minimal placeholder today (`backend/node/`) — not yet wired to a database or to the frontend; a seeded-Postgres word API is in progress |
| **CI**                  | GitHub Actions                           | Lint + build checks on frontend PRs (`.github/workflows/`)             |
| **AI Code Review**      | Gemini Code Assist                       | Automated review comments on PRs                                      |

---

## Quick Start

1.  **Clone & Enter:**

    ```bash
    git clone https://github.com/chingu-voyages/V61-tier3-team-99 && cd V61-tier3-team-99
    ```

2.  **Run the frontend (development):**

    ```bash
    cd frontend
    npm ci
    npm run dev
    ```

    Frontend: `http://localhost:5173`

3.  **Run the backend (development, optional):**

    ```bash
    cd backend/node
    npm ci
    npm run dev
    ```

    Backend: `http://localhost:5000`. It's currently a minimal placeholder — nothing in the frontend calls it yet.

4.  **Set up Supabase (leaderboard + "Sign in with GitHub"):**

    The hosted app (production and preview deployments) already runs against one shared Supabase project — if you're just testing a preview link or the deployed app, **you can skip this step entirely**. It's only needed if you want to run the frontend locally against your own separate Supabase project (e.g. for local development on these features, or if you're forking this repo).

    - Create a project at [supabase.com](https://supabase.com).
    - In the dashboard, go to **Authentication → Providers → GitHub** and enable it. This requires a GitHub OAuth App (GitHub → Settings → Developer settings → OAuth Apps) with its **Authorization callback URL** set to the callback URL shown on that Supabase provider page (`https://<project-ref>.supabase.co/auth/v1/callback`). Paste the OAuth App's Client ID/Secret into Supabase.
    - In **Settings → API**, copy the Project URL and the **publishable key** (`sb_publishable_...` — the current replacement for the legacy anon key; never use the secret key here).
    - In the SQL Editor, run [`supabase/migrations/0001_leaderboard.sql`](supabase/migrations/0001_leaderboard.sql) once to create the `leaderboard` table and its RPC.
    - In `frontend/`, copy `.env.example` to `.env.local` and fill in:

      ```env
      VITE_SUPABASE_URL=https://your-project-ref.supabase.co
      VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
      ```

    Without these set, the word game still works — sign-in and the leaderboard are simply unavailable.

---

## System Architecture

The basic architectural workflow is as follows:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#F0FDF4', 'primaryBorderColor': '#166534', 'primaryTextColor': '#166534', 'lineColor': '#64748b', 'fontSize': '14px'}}}%%
flowchart TD
    Start([Start New Game]) --> ClearBoard[Render Empty Grid & Keyboard]
    ClearBoard --> Input[Type 5-Letter Word]
    Input --> PressEnter[Press ENTER]

    PressEnter --> CheckWord{Is Word Valid?}
    CheckWord -->|No| ShakeRow[Shake Row / Alert User]
    ShakeRow --> Input

    CheckWord -->|Yes| FlipTiles[Flip Tiles & Reveal Colors]
    FlipTiles --> CheckWin{Is Guess Correct?}

    CheckWin -->|Yes: 🟩🟩🟩🟩🟩| Win([Game Won! Show Stats])

    CheckWin -->|No| CheckTries{Out of Tries? <br/> 6/6}
    CheckTries -->|Yes| Lose([Game Over! Show Word])
    CheckTries -->|No| NextRow[Move to Next Row]
    NextRow --> Input

    %% Styling
    style Start fill:#F1F5F9,stroke:#475569,color:#475569
    style CheckWord fill:#FFFBEB,stroke:#B45309,stroke-width:2px,color:#B45309
    style CheckWin fill:#FFFBEB,stroke:#B45309,stroke-width:2px,color:#B45309
    style CheckTries fill:#FFFBEB,stroke:#B45309,stroke-width:2px,color:#B45309
    style Win fill:#F0FDF4,stroke:#166534,stroke-width:2px,color:#166534
    style Lose fill:#FEF2F2,stroke:#991B1B,stroke-width:2px,color:#991B1B
```

---

## Meet the Team

| Name                        | Role          | Links                                                                                               |
| :-------------------------- | :------------ | :-------------------------------------------------------------------------------------------------- |
| **Alex Thomas**             | Scrum Master  | [GitHub](https://github.com/BagelTime) / [LinkedIn](https://linkedin.com/in/ajt11176)               |
| **Dustin Hoeppner**         | Web Developer | [GitHub](https://github.com/dhoepp) / [LinkedIn](https://linkedin.com/in/dustin-hoeppner)           |
| **John Omokhagbon Ezekiel** | Web Developer | [GitHub](https://github.com/Sirius1616) / [LinkedIn](https://www.linkedin.com/in/john-ezekiel-dev/) |
| **Lindsay Allen**           | Web Developer | [GitHub](https://github.com/lkallen) / [LinkedIn](https://www.linkedin.com/in/lindsay-allen-dev/)   |
| **Pratyusha Dasari**        | Web Developer | [GitHub](https://github.com/pratyusha-ds) / [LinkedIn](https://www.linkedin.com/in/pratyusha-ds/)   |
