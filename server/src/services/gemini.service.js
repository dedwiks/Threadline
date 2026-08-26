const MODEL_NAME = "gemini-flash-lite-latest";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

function buildPrompt({ name, company, profession }) {
  return `You are helping guess PROBABLE, PATTERN-BASED contact details for someone, based only on the information given below. You have no real knowledge of this specific person — you are inferring generic, common patterns (typical professional email formats, typical LinkedIn URL slug conventions), not recalling facts. Never imply certainty.

KNOWN INFO:
Name: ${name}
Company: ${company || "unknown"}
Profession: ${profession || "unknown"}

Respond with ONLY strict JSON (no markdown fences, no commentary) in exactly this shape:
{
  "email": "a plausible email guess using a common firstname.lastname@company-domain pattern, or an empty string if the company is unknown",
  "linkedin": "a plausible LinkedIn profile URL guess using the standard linkedin.com/in/firstname-lastname slug pattern",
  "twitter": "a plausible Twitter/X handle guess, or an empty string if there isn't enough to go on"
}

Guidelines:
- These are FORMAT guesses, not lookups of real facts — do not state or imply you know this is correct.
- If the company is unknown, leave "email" as an empty string rather than inventing a domain.
- Keep guesses simple and convention-based (lowercase, hyphens/dots as is typical).`;
}

function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

function toSuggestion(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed ? { value: trimmed, confidence: "low" } : null;
}

export async function probableDetails({ name, company, profession }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const prompt = buildPrompt({ name, company, profession });

  const res = await fetch(`${API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API request failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let parsed;
  try {
    parsed = JSON.parse(stripCodeFences(rawText));
  } catch {
    parsed = {};
  }

  const suggestions = {};
  for (const field of ["email", "linkedin", "twitter"]) {
    const suggestion = toSuggestion(parsed[field]);
    if (suggestion) suggestions[field] = suggestion;
  }

  return {
    suggestions,
    disclaimer: "AI-generated guess, unverified — confirm before relying on it.",
  };
}
