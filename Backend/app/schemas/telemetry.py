from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class TelemetryReport(BaseModel):
    grid_id: str = Field(min_length=1)
    city: str = Field(min_length=1)
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    threat_score: float = Field(ge=0, le=100)
    severity: Literal["low", "medium", "high", "critical"]
    timestamp: datetime


class IngestResponse(BaseModel):
    status: str = "ok"
    processed: int
