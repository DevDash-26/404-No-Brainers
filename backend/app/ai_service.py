import json
import os
from typing import Any

from google import genai
from google.genai import types


MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")


def choose_route(message: str) -> str | None:
    text = message.lower()

    if any(word in text for word in [
        "deadline",
        "calendar",
        "exam",
        "semester",
        "date"
    ]):
        return "/calendar"

    if any(word in text for word in [
        "event",
        "workshop",
        "lecture",
        "activity"
    ]):
        return "/events"

    if any(word in text for word in [
        "wifi",
        "wi-fi",
        "password",
        "login",
        "computer",
        "it support"
    ]):
        return "/it-support"

    if any(word in text for word in [
        "staff",
        "lecturer",
        "contact",
        "department",
        "email"
    ]):
        return "/staff"

    if any(word in text for word in [
        "tutor",
        "study group",
        "mentor",
        "academic support",
        "help with"
    ]):
        return "/academic-support"

    if any(word in text for word in [
        "schedule",
        "cancelled",
        "canceled",
        "closure",
        "changed",
        "room change"
    ]):
        return "/schedule-changes"

    if any(word in text for word in [
        "announcement",
        "notice",
        "news"
    ]):
        return "/announcements"

    return None


def answer_with_ai(
    question: str,
    context: dict[str, Any]
) -> str:

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return (
            "The Gemini AI service is not configured yet. "
            "Add GEMINI_API_KEY to the backend .env file."
        )

    client = genai.Client(api_key=api_key)

    system_instruction = """
You are the UCL Campus Assistant.

You help students find information about university life.

IMPORTANT RULES:

1. Answer using ONLY the university information supplied to you.
2. Never invent university information.
3. Never invent:
   - academic deadlines
   - timetable changes
   - events
   - staff names
   - staff contact details
   - IT support instructions
   - university policies
4. If the provided campus data does not contain the answer,
   clearly say that the information is not currently available.
5. Prefer information relevant to the student's faculty,
   programme and year.
6. Keep answers clear, concise and student-friendly.
7. If appropriate, tell the student which section of the app
   they can open for more information.
"""

    prompt_data = {
        "student_question": question,
        "campus_information": context,
    }

    response = client.models.generate_content(
        model=MODEL,
        contents=json.dumps(
            prompt_data,
            default=str
        ),
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.3,
        ),
    )

    if not response.text:
        return "I could not generate an answer from the available campus information."

    return response.text