"""Create the grid_threats table in Supabase.

Uses the Supabase Management API to execute DDL via the project's database.
Falls back to printing SQL for manual execution if the API is unavailable.
"""

import asyncio
import os
import sys

import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").strip()
SUPABASE_KEY = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "").strip()

# Extract project ref from URL: https://<ref>.supabase.co
PROJECT_REF = SUPABASE_URL.split("//")[-1].split(".")[0] if SUPABASE_URL else ""

CREATE_TABLE_SQL = """\
CREATE TABLE IF NOT EXISTS grid_threats (
  grid_id      TEXT PRIMARY KEY,
  city         TEXT NOT NULL,
  lat          DOUBLE PRECISION NOT NULL,
  lon          DOUBLE PRECISION NOT NULL,
  threat_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  threat_level TEXT NOT NULL DEFAULT 'Low',
  report_count INTEGER NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);"""

ENABLE_REALTIME_SQL = (
    "DO $$ BEGIN "
    "ALTER PUBLICATION supabase_realtime ADD TABLE grid_threats; "
    "EXCEPTION WHEN duplicate_object THEN NULL; "
    "END $$;"
)

REST_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


async def _table_exists(client: httpx.AsyncClient) -> bool:
    resp = await client.get(
        f"{SUPABASE_URL}/rest/v1/grid_threats",
        params={"select": "grid_id", "limit": "1"},
        headers=REST_HEADERS,
    )
    return resp.status_code == 200


async def _exec_sql_via_rpc(client: httpx.AsyncClient, sql: str) -> bool:
    """Execute SQL via PostgREST RPC by calling a custom exec function, or via /pg endpoint."""
    endpoints = [
        (f"{SUPABASE_URL}/pg/query", {"query": sql}),
        (f"{SUPABASE_URL}/rest/v1/rpc/exec_sql", {"sql": sql}),
    ]
    for url, body in endpoints:
        try:
            resp = await client.post(url, headers=REST_HEADERS, json=body)
            if resp.status_code in (200, 201):
                return True
        except Exception:
            continue
    return False


async def main() -> None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[FAIL] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env")
        sys.exit(1)

    async with httpx.AsyncClient(timeout=15.0) as client:
        print(f"Connecting to {SUPABASE_URL} ...")

        if await _table_exists(client):
            print("[OK] Table 'grid_threats' already exists")
            return

        print("  Table not found. Attempting auto-creation ...")

        # Try SQL endpoints
        if await _exec_sql_via_rpc(client, CREATE_TABLE_SQL):
            print("[OK] Table 'grid_threats' created")
            await _exec_sql_via_rpc(client, ENABLE_REALTIME_SQL)
            print("[OK] Realtime enabled for grid_threats")
            return

        # Fallback
        print("")
        print("[FAIL] Auto-creation not available on this Supabase instance.")
        print("  Run the following SQL in your Supabase Dashboard > SQL Editor:")
        print("")
        print(CREATE_TABLE_SQL)
        print("")
        print(ENABLE_REALTIME_SQL.replace("DO $$ BEGIN ", "").replace(" EXCEPTION WHEN duplicate_object THEN NULL; END $$;", ""))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
