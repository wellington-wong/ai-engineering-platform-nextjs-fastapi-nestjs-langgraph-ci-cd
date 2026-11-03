
import os
from pathlib import Path
from datetime import datetime, timezone

import joblib
import pandas as pd

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sklearn.ensemble import IsolationForest


load_dotenv()

# Database connection
engine = create_engine(
    os.environ["DATABASE_URL"]
)

# ML features
FEATURES = [
    "cpuUsagePercent",
    "memoryUsagePercent",
    "diskUsagePercent",
]

# Load historical metrics
query = """
        SELECT
            timestamp,
            "cpuUsagePercent",
            "memoryUsagePercent",
            "diskUsagePercent",
            "uptimeSeconds"
        FROM "SystemMetric"
        ORDER BY timestamp ASC \
        """

df = pd.read_sql_query(query, engine)

if len(df) < 100:
    raise ValueError("Insufficient historical data")

# Clean data
df["timestamp"] = pd.to_datetime(df["timestamp"])

X = df[FEATURES].replace(
    [float("inf"), float("-inf")],
    float("nan")
)

valid = X.notna().all(axis=1)

df = df.loc[valid].copy()
X = X.loc[valid].copy()

# Chronological train/test split
split_index = int(len(X) * 0.8)

X_train = X.iloc[:split_index]
X_test = X.iloc[split_index:]

# Initialize model
model = IsolationForest(
    n_estimators=200,
    contamination=0.02,
    random_state=42,
    n_jobs=-1
)

# Train using historical data
model.fit(X_train)

# Evaluate on later observations
predictions = model.predict(X_test)
scores = model.decision_function(X_test)

results = df.iloc[split_index:].copy()

results["anomaly"] = predictions == -1
results["anomaly_score"] = scores

# Save model artifact
artifact = {
    "model": model,
    "features": FEATURES,
    "model_version": "1.0.0",
    "trained_at": datetime.now(timezone.utc).isoformat(),
}

model_dir = Path("models")
model_dir.mkdir(exist_ok=True)

joblib.dump(
    artifact,
    model_dir / "isolation_forest.joblib"
)

# Report
print("\nTraining completed!")
print("Training records:", len(X_train))
print("Testing records:", len(X_test))
print("Detected anomalies:", results["anomaly"].sum())

print("\nTop unusual observations:")

print(
    results[results["anomaly"]][
        ["timestamp"] + FEATURES + ["anomaly_score"]
        ].head(20).to_string(index=False)
)
