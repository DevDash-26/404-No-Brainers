import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def ask_campus_ai(question, campus_context):
    prompt = f"""
You are the UCL Campus AI Assistant.

Your job is to help students find information about:
- announcements
- events
- academic support
- academic calendar
- schedule changes
- staff directory
- IT support

RULES:
1. Answer using ONLY the campus information provided below.
2. Do not invent university information.
3. If the answer is not available, say:
   "I couldn't find that information in the UCL Campus Hub."
4. Keep answers short and easy for students to understand.

CAMPUS INFORMATION:
{campus_context}

STUDENT QUESTION:
{question}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )

    return response.text


# Temporary data for testing
campus_data = """
Academic Calendar:
- Semester 1 examinations begin on 10 December.
- Assignment submission deadline is 25 November.

Events:
- DevDash Hackathon is being held on 19 September.
- Career Workshop is on 25 September.

Schedule Changes:
- Monday's Software Engineering lecture has moved to Room 302.

IT Support:
- Students can contact IT Support at the campus IT desk.

Staff Directory:
- Academic Office: Ground Floor.
- IT Support: First Floor.

Academic Support:
- Students can request peer tutoring through the Academic Support Office.
"""


if __name__ == "__main__":
    question = input("Ask UCL Assistant: ")
    answer = ask_campus_ai(question, campus_data)

    print("\nUCL Assistant:")
    print(answer)