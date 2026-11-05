
import pandas as pd

from fastapi import APIRouter, HTTPException

from app.schemas.anomaly import (
    AnomalyRequest,
    AnomalyResponse,
)
from app.ml.model_loader import get_model_artifact


router = APIRouter()


@router.post(
    "/predict",
    response_model=AnomalyResponse,
)
def predict_anomaly(request: AnomalyRequest):

    try:
        artifact = get_model_artifact()

        model = artifact["model"]
        features = artifact["features"]

        metrics = request.system.model_dump()

        # Preserve the exact feature ordering used during training
        df = pd.DataFrame(
            [[metrics[feature] for feature in features]],
            columns=features,
        )

        prediction = model.predict(df)[0]
        raw_score = model.decision_function(df)[0]

        return AnomalyResponse(
            isAnomaly=bool(prediction == -1),
            anomalyScore=float(-raw_score),
            modelVersion=artifact["model_version"],
        )

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Anomaly prediction failed: {error}",
        )
