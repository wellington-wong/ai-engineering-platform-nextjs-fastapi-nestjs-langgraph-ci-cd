
from functools import lru_cache
from pathlib import Path

import joblib


MODEL_PATH = (
        Path(__file__).resolve().parents[2]
        / "models"
        / "isolation_forest.joblib"
)


@lru_cache(maxsize=1)
def get_model_artifact():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model artifact not found: {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)
