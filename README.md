# [Project Name] - Wordle Clone

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3.x-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-27.x-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Enabled-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**[Project Name]** is a responsive full-stack web application based on the viral word puzzle game Wordle. Built as a collaborative team showcase, it pairs a fast client UI with a robust back-end engine tracking user statistics, game history, and leaderboards.

**[Live Demo]()** | **[API Documentation]()**

---

## Project Overview

### The Challenge

Building an engaging puzzle game on the web demands seamless execution across three key domains:

- **State Syncing** by managing continuous keyboard interaction, row validations, and flip animations without performance drops.
- **Data Persistence** by keeping long-term track of user win streaks, distribution data, and game history securely.
- **Fair Play** by preventing simple client-side inspection (such as looking at local storage or network networks) from revealing the word prematurely.

### Project Vision

Our goal is to build a professional Wordle ecosystem by:

1. Offering fluid CSS transitions and an accessible layout across all screens.
2. Generating target words on an isolated server engine to stop client-side tampering.
3. Fostering community replay value with global stat profiles and daily rank tracking.

---

## Key Features

- **On-screen virtual keyboard** that dynamically updates key states (correct, misplaced, wrong) in real time.

- **Unlimited Word Engine** serving a unified hidden word after every game.

- **Global Leaderboards** highlighting users with the fastest or most efficient puzzle clears.

- **Responsive Design** optimized for mobile browsers, tablets, and desktop workstations.

---

## Tech Stack

| Layer               | Technology                  | Key Features                                                |
| :------------------ | :-------------------------- | :---------------------------------------------------------- |
| **Frontend**        | **React 19**                | Hooks, Context API, Tailwind CSS, Animate.css               |
| **Backend**         |                             | Word Validation, Dictionary Engine                          |
| **Database**        | **PostgreSQL 17**           | Relational schemas for users, streaks, and global ranks     |
| **Authentication**  | **JWT / Bcrypt**            | Secure stateless session tokens and password safety         |
| **DevOps**          | **Docker & Docker Compose** | Containerized web client and isolated API services          |
| **CI/CD**           | **GitHub Actions**          | Automated **Vitest** testing, linting, & deployments        |
| **AI Intelligence** |                             | Automated PR code reviews, bug catching, & lint suggestions |

---

## Quick Start

Ensure you have **Docker 27** and **Docker Compose** installed.

1.  **Clone & Enter:**

    ```bash
    git clone https://github.com/chingu-voyages/V61-tier3-team-99 && cd V61-tier3-team-99
    ```

2.  **Environment Setup:** Create a `.env` file in the root:

    ```env
    DB_PASSWORD=your_secure_password
    JWT_SECRET=your_jwt_secret_token
    ```

3.  **Spin up the Stack:**

    ```bash
    docker-compose up --build
    ```

    - Frontend: `http://localhost:3000`
    - Backend API: `http://localhost:5000`
    - Postgres: `localhost:5432`

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

## License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/license/mit/) file for details.
