<div align="center">

<h1>🛡️ VEIL</h1>
<p><strong>Real-time, privacy-preserving threat detection dashboard</strong></p>
<p>A 16×16 city-grid heatmap that ingests telemetry, applies differential privacy noise, and streams live updates — all in real time.</p>

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

<br/>

![JavaScript](https://img.shields.io/badge/JavaScript-77.3%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-16.3%25-3776AB?style=flat-square&logo=python&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-5.7%25-1572B6?style=flat-square&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Hackathon](https://img.shields.io/badge/Codorra-2026_Hackathon-FF6B6B?style=flat-square)

</div>

---

## 📖 Overview

**Veil** is a real-time threat detection dashboard built for urban-scale monitoring. It visualises a **16×16 city grid** as a live heatmap, where each cell represents aggregated threat telemetry from sensors across the city.

To protect individual privacy, all incoming data is processed through a **Laplace differential-privacy mechanism (ε-DP)** before it ever touches the database. The backend continuously aggregates signals using an **Exponential Moving Average (EMA)**, flushes sanitised snapshots to **Supabase** every 2.5 seconds, and the frontend subscribes to those updates via **Supabase Realtime** — giving operators a live, privacy-safe operational picture.

When no Supabase credentials are configured, the dashboard seamlessly falls back to a **local mock simulation**, making it instantly runnable for development and demos.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Live City Grid** | 16×16 heatmap with per-cell threat intensity rendered in real time |
| 🔒 **Differential Privacy** | Laplace mechanism (ε-DP) with decaying ε budget and sensitivity-bounded noise |
| 📡 **Realtime Streaming** | Supabase Realtime pushes grid updates to all connected clients instantly |
| ⚡ **High-Throughput Simulator** | Async Python simulator streams ~200 RPS of noised telemetry to the backend |
| 📊 **EMA Aggregation** | Exponential Moving Average (α = 0.3) smooths per-cell values before flushing |
| 🎨 **Animated UI** | Framer Motion-powered transitions across the sidebar, topbar, and status bar |
| 🧪 **Mock Mode** | Runs entirely offline without any Supabase credentials — great for demos |
| 🛠️ **Modular Architecture** | Clean separation between API routes, services, schemas, and privacy primitives |

---

## 🏗️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) | UI framework |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Build tool & dev server |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Animations & transitions |

### Backend

| Technology | Purpose |
|---|---|
| ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | REST API (`POST /api/v1/ingest`) |
| ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) | Async simulator & privacy primitives |
| ![Pydantic](https://img.shields.io/badge/Pydantic_v2-E92063?style=flat-square&logo=pydantic&logoColor=white) | Data validation & schemas |
| ![httpx](https://img.shields.io/badge/httpx-00897B?style=flat-square) | Async HTTP client |

### Infrastructure & Database

| Technology | Purpose |
|---|---|
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | Postgres database + Realtime subscriptions |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) | Persistent grid state storage |

---

## 📁 Project Structure

```
Veil/
├── Backend/
│   ├── app/
│   │   ├── api/              # POST /api/v1/ingest — telemetry ingestion endpoint
│   │   ├── core/             # App config & Supabase client initialisation
│   │   ├── schemas/          # Pydantic v2 request/response models
│   │   └── services/         # EMA aggregator + periodic Supabase flush loop
│   ├── simulation/           # Laplace noise engine & privacy primitives
│   ├── setup_db.py           # One-shot: creates grid_threats table + Realtime config
│   └── requirements.txt
│
└── Frontend/
    └── src/
        ├── components/       # MapGrid, Sidebar, Topbar, StatusBar
        ├── hooks/            # useGridData — handles both mock & live Supabase data
        └── styles/           # CSS design tokens & responsive layout rules
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- A **Supabase** project *(optional — the app works in mock mode without it)*

---

### 1. Clone the Repository

```bash
git clone https://github.com/Arshrizz/Codorra-2026-Hackathon.git
cd Codorra-2026-Hackathon
```

---

### 2. Backend Setup

```bash
cd Backend

# Create and activate a virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# → Open .env and fill in your Supabase credentials

# Initialise the database (creates grid_threats table + Realtime)
python setup_db.py

# Start the API server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

---

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# (Optional) Configure Supabase for live data
# Create a .env file and add:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Without these, the dashboard runs in mock simulation mode automatically
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

---

### 4. Run the Telemetry Simulator

```bash
cd Backend

# Stream ~200 RPS of privacy-noised telemetry to the backend
python -m simulation.simulator
```

---

## 🔑 Environment Variables

### Backend — `Backend/.env`

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (**backend only** — never expose client-side) |

### Frontend — `Frontend/.env`

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

> **Note:** If the frontend `.env` variables are not set, the app automatically falls back to a local mock simulation — no backend needed.

---

## 🔐 Privacy Model

Veil is built with privacy as a first-class concern, not an afterthought.

| Parameter | Value |
|---|---|
| **Mechanism** | Laplace (ε-differential privacy) |
| **Sensitivity** | `1.0` |
| **Initial ε budget** | `1.0` |
| **ε decay** | Decrements per tick, floors at `0.05` |
| **Aggregation** | EMA with α = `0.3` per grid cell |
| **Flush interval** | Every `2.5s` to Supabase |

Raw telemetry is **never stored**. Only privacy-noised, EMA-smoothed aggregates reach the database.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built for the <strong>Codorra 2026 Hackathon</strong></p>
  <p>
    <a href="https://github.com/Arshrizz/Codorra-2026-Hackathon">⭐ Star this repo</a>
    ·
    <a href="https://github.com/Arshrizz/Codorra-2026-Hackathon/issues">🐛 Report a Bug</a>
    ·
    <a href="https://github.com/Arshrizz/Codorra-2026-Hackathon/issues">💡 Request a Feature</a>
  </p>
</div>
