# VEIL — Frontend

> Privacy-Preserving Societal Threat Detection Dashboard  
> Stack: React + Vite · Framer Motion · Supabase Realtime

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |

---

## Environment Setup

The frontend connects to a Supabase instance for realtime grid data. If no env vars are present, the app runs a full mock simulation automatically — no Supabase connection required to see the UI working.

1. Copy the env template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Supabase Table Schema

```sql
create table public.grid_aggregates (
  grid_id       text primary key,          -- format: "RR-CC" (e.g. "03-11")
  signal_count  integer not null default 0,
  noise_delta   float   not null default 0,
  last_updated  timestamptz not null default now(),
  threat_level  text not null default 'safe'
    check (threat_level in ('safe', 'elevated', 'threat'))
);

-- Enable realtime
alter publication supabase_realtime add table public.grid_aggregates;
```

---

## Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Build

```bash
npm run build
npm run preview
```

---

## Design Constraints

- **Typography**: IBM Plex Mono 700 (display), DM Mono 400 (body), Roboto Mono 500 (data)
- **Colors**: All from CSS custom properties in `src/styles/globals.css` — zero hardcoded hex in components
- **Motion**: Framer Motion ≥ 10 for JS animations; CSS `@keyframes` for ripple + pulse only
- **Layout**: Ops-center panel system — no hero sections, no centered content, no glassmorphism
- **Min-width**: 1280px (ops dashboard, not mobile)
