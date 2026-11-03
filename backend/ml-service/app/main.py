from fastapi import FastAPI
from app.api.anomaly import router as anomaly_router


app = FastAPI(
    title="Observability ML API",
    description="Machine learning service for VPS monitoring",
    version="0.1.0"
)

app.include_router(
    anomaly_router,
    prefix="/api/v1/anomaly",
    tags=["Anomaly Detection"]
)

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "observability-ml"
    }