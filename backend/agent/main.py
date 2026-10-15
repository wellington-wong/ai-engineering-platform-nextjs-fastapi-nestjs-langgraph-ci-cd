"""A small LangChain model call orchestrated by a LangGraph workflow."""

from __future__ import annotations

import argparse
import os
from typing import TypedDict

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph

app = FastAPI(title="LangGraph Agent")


class QuestionRequest(BaseModel):
    question: str


class AnswerResponse(BaseModel):
    answer: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ask", response_model=AnswerResponse)
def ask(request: QuestionRequest) -> AnswerResponse:
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured")

    result = build_graph().invoke({"question": request.question, "answer": ""})
    return AnswerResponse(answer=result["answer"])


class AgentState(TypedDict):
    question: str
    answer: str


def build_graph():
    """Build the one-step question-answering graph."""
    model = ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a helpful assistant. Answer clearly and concisely."),
            ("human", "{question}"),
        ]
    )
    chain = prompt | model

    def answer_question(state: AgentState) -> AgentState:
        response = chain.invoke({"question": state["question"]})
        return {"question": state["question"], "answer": str(response.content)}

    graph = StateGraph(AgentState)
    graph.add_node("answer", answer_question)
    graph.add_edge(START, "answer")
    graph.add_edge("answer", END)
    return graph.compile()


def main() -> None:
    parser = argparse.ArgumentParser(description="Ask a question using a LangGraph agent.")
    parser.add_argument("question", help="The question to send to the assistant")
    args = parser.parse_args()

    if not os.getenv("OPENAI_API_KEY"):
        parser.error("set OPENAI_API_KEY before running the assistant")

    result = build_graph().invoke({"question": args.question, "answer": ""})
    print(result["answer"])


if __name__ == "__main__":
    main()
