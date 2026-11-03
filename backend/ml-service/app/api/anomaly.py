from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def anomaly_status():
    return {
        "message": "Anomaly detection service ready"
    }