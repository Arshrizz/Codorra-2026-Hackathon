# ⚙️ Backend Architecture & Tech Stack (Veil)

## Overview

The backend of **Veil** serves as the high-speed ingestion engine and aggregation layer. Instead of a traditional CRUD application, this backend is optimized to receive thousands of simulated telemetry reports, validate them, apply macro-level threat calculations, and pipe the data directly into a real-time database to trigger the Command Center UI.

***

## 🛠 Tech Stack Breakdown

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Language** | Python 3.10+ | Fast execution for mathematical modeling and data generation. |
| **Framework** | FastAPI | High-performance, async API framework for catching simulated data payloads. |
| **Server** | Uvicorn | ASGI web server to run FastAPI asynchronously. |
| **Validation** | Pydantic | Enforces strict JSON schema validation for incoming threat reports. |
| **Database** | Supabase (PostgreSQL) | Relational state management and aggregation of city grid data. |
| **Real-Time** | Supabase Realtime | Native WebSocket broadcasting to push threat spikes to the React frontend instantly. |

***

## 🏗 Component Details

### 1. The Ingestion Engine (FastAPI)

The core backend server is deliberately lightweight. It exposes a single, high-throughput `POST` endpoint to catch telemetry data.

- **Async Handling:** Built natively on ASGI, allowing it to process thousands of concurrent requests from the simulation script without blocking.
- **Schema Enforcement:** Uses Pydantic models to instantly reject malformed data (e.g., missing grid coordinates or invalid threat severities).
- **Aggregation Logic:** Processes incoming "noisy" data, groups it by city grid, and executes database inserts/updates.

### 2. State & Real-Time Layer (Supabase)

We bypass complex manual WebSocket infrastructure by utilizing Supabase.

- **PostgreSQL:** Handles relational grouping of the threat reports.
- **Real-time Subscriptions:** When the FastAPI server pushes a row update indicating a grid has crossed the "Critical Threat" threshold, Supabase automatically broadcasts this payload over WebSockets to the React frontend.

### 3. The Simulation Script (`simulator.py`)

Since we are focusing on the system's macro-impact, we use a Python script to simulate edge-device activity.

- **Differential Privacy Logic:** Injects mathematical noise into the generated payloads to simulate the privacy-preserving "coin flip" mechanism before data hits the server.
- **Load Generation:** Uses the `requests` and `time` libraries to continuously blast JSON payloads at the FastAPI endpoint during the demo.

***

## 📂 Directory Structure

```text
backend/
├── app/
│   ├── api/              # API routers and endpoints
│   ├── core/             # Config, env vars, and Supabase client setup
│   ├── schemas/          # Pydantic models for request/response validation
│   ├── services/         # Threat aggregation and business logic
│   └── main.py           # FastAPI application initialization
├── simulation/
│   ├── simulator.py      # The load-generation and data-mocking script
│   └── privacy.py        # Differential privacy noise algorithms
├── requirements.txt      # Python dependencies
└── .env                  # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

***

## Workflow Orchestration

### 1. Plan Node Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed spec upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

***

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

***

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.