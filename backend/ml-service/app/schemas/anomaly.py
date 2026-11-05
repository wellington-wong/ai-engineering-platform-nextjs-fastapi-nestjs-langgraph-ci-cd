
from pydantic import BaseModel, Field


class SystemMetricsInput(BaseModel):
    cpuUsagePercent: float = Field(ge=0, le=100)
    memoryUsagePercent: float = Field(ge=0, le=100)
    diskUsagePercent: float = Field(ge=0, le=100)


class AnomalyRequest(BaseModel):
    system: SystemMetricsInput


class AnomalyResponse(BaseModel):
    isAnomaly: bool
    anomalyScore: float
    modelVersion: str
