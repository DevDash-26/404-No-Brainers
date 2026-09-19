from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from ai_assistant import ask_campus_ai, campus_data


app = FastAPI(title="UCL Campus AI API")


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ai/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question."
        )

    try:
        answer = ask_campus_ai(
            question=message,
            campus_context=campus_data
        )

        return ChatResponse(response=answer)

    except Exception:
        return ChatResponse(
            response=(
                "The UCL Campus AI Assistant is temporarily unavailable. "
                "Please try again shortly."
            )
        )