FROM python:3.12-slim

# Copy uv into the image

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
# Python and uv configuration
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    MODEL_PATH=/app/models/isolation_forest.joblib

WORKDIR /app

# Install dependencies first for better Docker layer caching
COPY pyproject.toml uv.lock README.md ./

RUN uv sync --locked --no-dev --no-install-project

# Copy application and trained model
COPY src/ ./src/
COPY models/ ./models/

# Install the project itself
RUN uv sync --locked --no-dev

# Make the virtual environment available
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "ml_service.main:app", "--host", "0.0.0.0", "--port", "8000"]