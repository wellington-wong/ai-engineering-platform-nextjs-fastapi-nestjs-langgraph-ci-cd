# Adaptive Project Discovery Agent

FastAPI serves a six step adaptive interview at `/sessions`. Create a session with a project description, submit answers using the current `step_index`, and fetch the completed overview from `/sessions/{id}/overview`. The interactive API is exposed by `main:app` (for example, `uvicorn main:app`). Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` to enable LangChain structured generation.

Sessions are held in process memory. They are lost on restart and are not shared across workers; use a durable shared store and authentication before exposing this API to multiple users or instances. Per session locking prevents duplicate concurrent advances within one process. If model generation fails after answers are accepted, the answers remain available and the same submission can be retried.
