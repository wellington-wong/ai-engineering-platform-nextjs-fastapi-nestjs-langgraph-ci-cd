"""Adaptive project discovery API backed by a LangGraph workflow."""

from __future__ import annotations

import argparse
import os
import threading
import uuid
from datetime import date
from typing import Any, Literal, TypedDict

from fastapi import FastAPI, HTTPException
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, ConfigDict, Field, model_validator

MAX_STEPS = 6


class FormField(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(min_length=1)
    label: str = Field(min_length=1)
    type: Literal["text", "textarea", "number", "select", "radio", "checkbox", "date"]
    required: bool = False
    choices: list[str] | None = None
    helper_text: str | None = None

    @model_validator(mode="after")
    def validate_choices(self) -> "FormField":
        if self.type in ("select", "radio", "checkbox") and not self.choices:
            raise ValueError(f"{self.type} fields require at least one choice")
        if self.choices is not None and len(self.choices) != len(set(self.choices)):
            raise ValueError("Field choices must be unique")
        return self


class FormStep(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    fields: list[FormField] = Field(min_length=1, max_length=12)


class OverviewSection(BaseModel):
    model_config = ConfigDict(extra="forbid")
    summary: str
    goals: list[str]
    problem: str
    audience: list[str]
    solution: str
    scope: list[str]
    requirements: list[str]
    risks: list[str]
    assumptions: list[str]
    open_questions: list[str]


class ProjectOverview(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str
    sections: OverviewSection


class CreateSessionRequest(BaseModel):
    project_description: str = Field(min_length=1, max_length=10000)


class SubmitAnswersRequest(BaseModel):
    step_index: int = Field(ge=0)
    answers: dict[str, Any]


class SessionResponse(BaseModel):
    id: str
    project_description: str
    step_index: int
    max_steps: int
    user_facts: dict[str, Any]
    ai_inferences: list[str]
    unanswered_questions: list[str]
    interview_history: list[dict[str, Any]]
    current_step: FormStep | None
    completed: bool
    final_overview: ProjectOverview | None


class InterviewState(TypedDict):
    project_description: str
    step_index: int
    max_steps: int
    user_facts: dict[str, Any]
    ai_inferences: list[str]
    unanswered_questions: list[str]
    interview_history: list[dict[str, Any]]
    current_step: FormStep | None
    final_overview: ProjectOverview | None
    task: Literal["step", "overview"]


class Session:
    def __init__(self, state: InterviewState):
        self.state = state
        self.lock = threading.RLock()
        # An accepted answer set is retained if generation fails, so an identical
        # retry resumes generation without applying the answers twice.
        self.accepted: dict[int, dict[str, Any]] = {}


SESSIONS: dict[str, Session] = {}
SESSIONS_LOCK = threading.Lock()
app = FastAPI(title="Adaptive Project Discovery Agent")


def _llm():
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is not configured")
    return ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), temperature=0).with_structured_output(FormStep)


def _generate_step(state: InterviewState) -> FormStep:
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You conduct an adaptive project discovery interview. Return one useful form step with 1-8 fields. Be topic agnostic, use stable machine IDs, and only ask questions that add useful context. For select, radio, and checkbox fields, include choices. Do not repeat answered questions. Treat user answers as facts and label uncertain deductions as assumptions."),
        ("human", "Project description: {description}\nStep: {step} of {maximum}\nKnown user facts: {facts}\nPrior interview: {history}\nInferences so far: {inferences}\nOpen questions: {open_questions}"),
    ])
    # Constructing with_structured_output at call time keeps model setup replaceable in tests.
    model = _llm()
    return (prompt | model).invoke({
        "description": state["project_description"], "step": state["step_index"] + 1,
        "maximum": state["max_steps"], "facts": state["user_facts"],
        "history": state["interview_history"], "inferences": state["ai_inferences"],
        "open_questions": state["unanswered_questions"],
    })


def _generate_overview(state: InterviewState) -> ProjectOverview:
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is not configured")
    model = ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), temperature=0).with_structured_output(ProjectOverview)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Create a comprehensive, topic-agnostic project overview using the supplied structure. Adapt each section to the topic. Explicit user facts are authoritative. Put unverified deductions only in assumptions and list unresolved items as open questions. Do not invent facts."),
        ("human", "Project: {description}\nExplicit user facts: {facts}\nAI inferences: {inferences}\nInterview history: {history}"),
    ])
    return (prompt | model).invoke({"description": state["project_description"], "facts": state["user_facts"], "inferences": state["ai_inferences"], "history": state["interview_history"]})


def build_graph():
    """Build the LangGraph node used to generate one step or the overview."""
    def generate(state: InterviewState) -> dict[str, Any]:
        if state["task"] == "step":
            step = _generate_step(state)
            ids = [field.id for field in step.fields]
            if len(ids) != len(set(ids)):
                raise ValueError("Generated form field IDs must be unique")
            return {"current_step": step}
        return {"final_overview": _generate_overview(state)}

    graph = StateGraph(InterviewState)
    graph.add_node("generate", generate)
    graph.add_edge(START, "generate")
    graph.add_edge("generate", END)
    return graph.compile()


def _run(state: InterviewState) -> InterviewState:
    return build_graph().invoke(state)


def _response(session_id: str, state: InterviewState) -> SessionResponse:
    return SessionResponse(id=session_id, **{k: v for k, v in state.items() if k != "task"}, completed=state["final_overview"] is not None)


def _validate_answers(step: FormStep, answers: dict[str, Any]) -> None:
    fields = {field.id: field for field in step.fields}
    unknown = set(answers) - set(fields)
    if unknown:
        raise HTTPException(status_code=422, detail=f"Unknown field IDs: {', '.join(sorted(unknown))}")
    for field_id, field in fields.items():
        if field.required and (field_id not in answers or answers[field_id] is None or answers[field_id] == "" or answers[field_id] == []):
            raise HTTPException(status_code=422, detail=f"Field '{field_id}' is required")
        if field_id not in answers or answers[field_id] is None:
            continue
        value = answers[field_id]
        valid = True
        if field.type in ("text", "textarea"):
            valid = isinstance(value, str)
        elif field.type == "number":
            valid = isinstance(value, (int, float)) and not isinstance(value, bool)
        elif field.type == "date":
            valid = isinstance(value, str)
            if valid:
                try:
                    date.fromisoformat(value)
                except ValueError:
                    valid = False
        elif field.type in ("select", "radio"):
            valid = isinstance(value, str) and field.choices is not None and value in field.choices
        elif field.type == "checkbox":
            valid = isinstance(value, list) and field.choices is not None and all(isinstance(v, str) and v in field.choices for v in value) and len(value) == len(set(value))
        if not valid:
            raise HTTPException(status_code=422, detail=f"Invalid value for field '{field_id}' ({field.type})")


def _http_generation_error(exc: Exception) -> HTTPException:
    status = 503 if "OPENAI_API_KEY is not configured" in str(exc) else 502
    return HTTPException(status_code=status, detail=f"Unable to generate the next interview result: {exc}")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/sessions", response_model=SessionResponse, status_code=201)
def create_session(request: CreateSessionRequest) -> SessionResponse:
    initial: InterviewState = {
        "project_description": request.project_description, "step_index": 0, "max_steps": MAX_STEPS,
        "user_facts": {}, "ai_inferences": [], "unanswered_questions": [], "interview_history": [],
        "current_step": None, "final_overview": None, "task": "step",
    }
    try:
        state = _run(initial)
    except Exception as exc:
        raise _http_generation_error(exc) from exc
    session_id = str(uuid.uuid4())
    session = Session(state)
    with SESSIONS_LOCK:
        SESSIONS[session_id] = session
    return _response(session_id, state)


def _get_session(session_id: str) -> Session:
    with SESSIONS_LOCK:
        session = SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(session_id: str) -> SessionResponse:
    session = _get_session(session_id)
    with session.lock:
        return _response(session_id, session.state)


@app.post("/sessions/{session_id}/answers", response_model=SessionResponse)
def submit_answers(session_id: str, request: SubmitAnswersRequest) -> SessionResponse:
    session = _get_session(session_id)
    with session.lock:
        state = session.state
        if state["final_overview"] is not None:
            raise HTTPException(status_code=409, detail="Session is already complete")
        expected = state["step_index"]
        if request.step_index != expected:
            raise HTTPException(status_code=409, detail=f"Expected step_index {expected}")
        previous = session.accepted.get(expected)
        if previous is not None and previous != request.answers:
            raise HTTPException(status_code=409, detail="Answers for this step were already accepted; retry with the same answers")
        if previous is None:
            if state["current_step"] is None:
                raise HTTPException(status_code=409, detail="No current step is available")
            _validate_answers(state["current_step"], request.answers)
            session.accepted[expected] = dict(request.answers)
            state["user_facts"] = {**state["user_facts"], **{f"step_{expected + 1}.{k}": v for k, v in request.answers.items()}}
            state["interview_history"] = [*state["interview_history"], {"step_index": expected, "title": state["current_step"].title, "answers": dict(request.answers)}]
            state["unanswered_questions"] = [f.label for f in state["current_step"].fields if f.id not in request.answers]
        next_index = expected + 1
        candidate = dict(state)
        try:
            if next_index < state["max_steps"]:
                candidate["step_index"] = next_index
                candidate["task"] = "step"
                candidate.update(_run(candidate))
            else:
                candidate["step_index"] = next_index
                candidate["current_step"] = None
                candidate["task"] = "overview"
                candidate.update(_run(candidate))
        except Exception as exc:
            # Facts/history are retained and the same request can retry generation.
            raise _http_generation_error(exc) from exc
        state.update(candidate)
        return _response(session_id, state)


@app.get("/sessions/{session_id}/overview", response_model=ProjectOverview)
def get_overview(session_id: str) -> ProjectOverview:
    session = _get_session(session_id)
    with session.lock:
        if session.state["final_overview"] is None:
            raise HTTPException(status_code=409, detail="Session is not complete")
        return session.state["final_overview"]


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the adaptive project discovery API.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    import uvicorn
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
