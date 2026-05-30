# VEIL

Real-time, differential-privacy threat detection dashboard. A 16×16 city-grid heatmap that ingests telemetry, applies Laplace noise, and streams live updates via Supabase Realtime.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Framer Motion |
| Backend | FastAPI, httpx, Pydantic v2 |
| Database | Supabase (Postgres + Realtime) |
| Privacy | Laplace mechanism (ε-DP) |
| Simulation | Python async simulator |

## Project Structure

```
├── Backend/
│   ├── app/
│   │   ├── api/          # POST /api/v1/ingest
│   │   ├── core/         # Config, Supabase client
│   │   ├── schemas/      # Pydantic models
│   │   └── services/     # EMA aggregator + flush loop
│   ├── simulation/       # Laplace noise, privacy primitives
│   ├── setup_db.py       # One-shot table + Realtime setup
│   └── requirements.txt
└── Frontend/
    └── src/
        ├── components/   # MapGrid, Sidebar, Topbar, StatusBar
        ├── hooks/        # useGridData (mock + Supabase)
        └── styles/       # CSS tokens, responsive layout
```

## Getting Started

### Backend

```bash
cd Backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env                              # fill in your Supabase credentials
python setup_db.py                               # create grid_threats table
uvicorn app.main:app --reload
```

### Frontend

```bash
cd Frontend
npm install
# Optional: add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env for live data
# Without them the dashboard runs in mock simulation mode
npm run dev
```

### Simulator

```bash
cd Backend
python -m simulation.simulator   # streams 200 rps of noised telemetry to the backend
```

## Environment Variables

Copy `Backend/.env.example` to `Backend/.env` and fill in:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (backend only, never expose client-side) |

For the frontend, create `Frontend/.env`:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

Without frontend env vars, the app falls back to a local mock simulation.

## Privacy Model

- **Mechanism**: Laplace (ε-differential privacy)  
- **Sensitivity**: 1.0  
- **ε budget**: starts at 1.0, decays per tick, floors at 0.05  
- **Aggregation**: EMA (α = 0.3) per grid cell, flushed to Supabase every 2.5s  
