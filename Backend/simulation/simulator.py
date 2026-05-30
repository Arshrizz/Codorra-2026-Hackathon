import asyncio
import random
import time
from datetime import datetime, timezone

import httpx

from simulation.privacy import laplace_noise

TARGET_URL = "http://127.0.0.1:8000/api/v1/ingest"
BATCH_SIZE = 50
RPS = 200
REPORT_INTERVAL_S = 5

MUMBAI_GRIDS = [
    {"grid_id": "MUM-001", "zone": "Colaba",         "lat": 18.9067, "lon": 72.8147},
    {"grid_id": "MUM-002", "zone": "Churchgate",     "lat": 18.9322, "lon": 72.8264},
    {"grid_id": "MUM-003", "zone": "Marine Lines",   "lat": 18.9432, "lon": 72.8234},
    {"grid_id": "MUM-004", "zone": "Dadar",          "lat": 19.0176, "lon": 72.8428},
    {"grid_id": "MUM-005", "zone": "Bandra",         "lat": 19.0596, "lon": 72.8295},
    {"grid_id": "MUM-006", "zone": "Andheri",        "lat": 19.1136, "lon": 72.8697},
    {"grid_id": "MUM-007", "zone": "Juhu",           "lat": 19.0883, "lon": 72.8264},
    {"grid_id": "MUM-008", "zone": "Powai",          "lat": 19.1176, "lon": 72.9060},
    {"grid_id": "MUM-009", "zone": "Kurla",          "lat": 19.0726, "lon": 72.8845},
    {"grid_id": "MUM-010", "zone": "Chembur",        "lat": 19.0522, "lon": 72.8994},
    {"grid_id": "MUM-011", "zone": "Goregaon",       "lat": 19.1663, "lon": 72.8526},
    {"grid_id": "MUM-012", "zone": "Malad",          "lat": 19.1874, "lon": 72.8484},
    {"grid_id": "MUM-013", "zone": "Borivali",       "lat": 19.2308, "lon": 72.8567},
    {"grid_id": "MUM-014", "zone": "Kandivali",      "lat": 19.2047, "lon": 72.8521},
    {"grid_id": "MUM-015", "zone": "Mira Bhayandar", "lat": 19.2952, "lon": 72.8544},
    {"grid_id": "MUM-016", "zone": "Thane",          "lat": 19.2183, "lon": 72.9781},
    {"grid_id": "MUM-017", "zone": "Navi Mumbai",    "lat": 19.0330, "lon": 73.0297},
    {"grid_id": "MUM-018", "zone": "Vikhroli",       "lat": 19.1101, "lon": 72.9268},
    {"grid_id": "MUM-019", "zone": "Mulund",         "lat": 19.1726, "lon": 72.9563},
    {"grid_id": "MUM-020", "zone": "Ghatkopar",      "lat": 19.0860, "lon": 72.9081},
    {"grid_id": "MUM-021", "zone": "Wadala",         "lat": 19.0178, "lon": 72.8545},
    {"grid_id": "MUM-022", "zone": "Worli",          "lat": 19.0006, "lon": 72.8150},
    {"grid_id": "MUM-023", "zone": "Lower Parel",    "lat": 18.9930, "lon": 72.8301},
    {"grid_id": "MUM-024", "zone": "Santacruz",      "lat": 19.0842, "lon": 72.8371},
    {"grid_id": "MUM-025", "zone": "Versova",        "lat": 19.1315, "lon": 72.8120},
]

HOT_ZONES = {"MUM-005", "MUM-008", "MUM-016", "MUM-022"}

SEVERITY_MAP = [(85, "critical"), (65, "high"), (40, "medium"), (0, "low")]


def _severity_for(score: float) -> str:
    for cutoff, label in SEVERITY_MAP:
        if score >= cutoff:
            return label
    return "low"


def _generate_report(grid: dict, elapsed_s: float) -> dict:
    gid = grid["grid_id"]

    if gid in HOT_ZONES:
        base = min(95.0, 20.0 + elapsed_s * 1.2 + random.gauss(0, 8))
    else:
        base = max(0.0, random.gauss(25, 15))

    noisy = laplace_noise(base, sensitivity=5.0, epsilon=1.5)

    return {
        "grid_id": gid,
        "city": "Mumbai",
        "lat": grid["lat"] + random.gauss(0, 0.002),
        "lon": grid["lon"] + random.gauss(0, 0.002),
        "threat_score": round(noisy, 2),
        "severity": _severity_for(noisy),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


async def run() -> None:
    total_sent = 0
    errors = 0
    start = time.monotonic()
    last_report = start
    delay = BATCH_SIZE / RPS

    async with httpx.AsyncClient(timeout=10.0) as client:
        print(f"\n>> Veil Simulator -- targeting {TARGET_URL}")
        print(f"   {len(MUMBAI_GRIDS)} grids | batch={BATCH_SIZE} | target={RPS} rps")
        print(f"   Hot zones: {', '.join(sorted(HOT_ZONES))}\n")

        while True:
            elapsed = time.monotonic() - start
            batch = [_generate_report(random.choice(MUMBAI_GRIDS), elapsed) for _ in range(BATCH_SIZE)]

            try:
                resp = await client.post(TARGET_URL, json=batch)
                resp.raise_for_status()
                total_sent += len(batch)
            except httpx.HTTPError as exc:
                errors += 1
                if errors <= 5:
                    print(f"   [ERR] {exc}")

            now = time.monotonic()
            if now - last_report >= REPORT_INTERVAL_S:
                rps = total_sent / (now - start) if now > start else 0
                print(f"   [{elapsed:.0f}s] sent={total_sent:,} | rps={rps:.0f} | errors={errors}")
                last_report = now

            await asyncio.sleep(delay)


if __name__ == "__main__":
    asyncio.run(run())
