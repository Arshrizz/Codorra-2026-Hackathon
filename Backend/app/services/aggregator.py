import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime, timezone

from app.core.supabase_client import get_client
from app.schemas.telemetry import TelemetryReport

logger = logging.getLogger(__name__)

ALPHA = 0.3  # EMA smoothing — higher = more reactive to recent reports
FLUSH_INTERVAL_S = 2.5

THRESHOLDS = [(85, "Critical"), (65, "High"), (40, "Moderate"), (0, "Low")]


def _classify(score: float) -> str:
    for cutoff, level in THRESHOLDS:
        if score >= cutoff:
            return level
    return "Low"


@dataclass
class GridState:
    city: str
    lat: float
    lon: float
    score: float = 0.0
    report_count: int = 0
    threat_level: str = "Low"
    dirty: bool = False


_grids: dict[str, GridState] = {}
_flush_task: asyncio.Task | None = None


async def process_batch(reports: list[TelemetryReport]) -> int:
    breach_ids: list[str] = []

    for r in reports:
        g = _grids.get(r.grid_id)
        if g is None:
            g = GridState(city=r.city, lat=r.lat, lon=r.lon)
            _grids[r.grid_id] = g

        g.score = r.threat_score if g.report_count == 0 else ALPHA * r.threat_score + (1 - ALPHA) * g.score
        g.report_count += 1
        g.dirty = True

        new_level = _classify(g.score)
        if new_level != g.threat_level:
            logger.info("Grid %s (%s): %s → %s  (score=%.1f)", r.grid_id, g.city, g.threat_level, new_level, g.score)
            g.threat_level = new_level
            breach_ids.append(r.grid_id)

    if breach_ids:
        await _upsert_grids(list(dict.fromkeys(breach_ids)))

    return len(reports)


async def _upsert_grids(grid_ids: list[str]) -> None:
    rows = []
    for gid in grid_ids:
        g = _grids[gid]
        rows.append({
            "grid_id": gid,
            "city": g.city,
            "lat": g.lat,
            "lon": g.lon,
            "threat_score": round(g.score, 2),
            "threat_level": g.threat_level,
            "report_count": g.report_count,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        g.dirty = False

    client = get_client()
    try:
        resp = await client.post(
            "/grid_threats",
            json=rows,
            headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
        )
        resp.raise_for_status()
    except Exception:
        logger.exception("Supabase upsert failed for grids: %s", grid_ids)
        for gid in grid_ids:
            if gid in _grids:
                _grids[gid].dirty = True


async def _periodic_flush() -> None:
    """Flush all dirty grids to Supabase every FLUSH_INTERVAL_S seconds."""
    while True:
        await asyncio.sleep(FLUSH_INTERVAL_S)
        dirty_ids = [gid for gid, g in _grids.items() if g.dirty]
        if dirty_ids:
            await _upsert_grids(dirty_ids)


def start_flush_loop() -> None:
    global _flush_task
    _flush_task = asyncio.create_task(_periodic_flush())


def stop_flush_loop() -> None:
    global _flush_task
    if _flush_task:
        _flush_task.cancel()
        _flush_task = None
