from fastapi import APIRouter

from app.schemas.telemetry import IngestResponse, TelemetryReport
from app.services.aggregator import process_batch

router = APIRouter(prefix="/api/v1")


@router.post("/ingest", response_model=IngestResponse)
async def ingest_telemetry(reports: list[TelemetryReport]) -> IngestResponse:
    count = await process_batch(reports)
    return IngestResponse(processed=count)
