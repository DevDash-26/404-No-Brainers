const AI_API_URL = "http://127.0.0.1:8000";

export async function askAI(message: string): Promise<string> {
  const response = await fetch(`${AI_API_URL}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();
  return data.response;
}