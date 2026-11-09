import { HttpError } from '../utils/httpError.js';

export async function callGemini(promptJson: unknown) {
  // Read dynamically so dotenv is guaranteed to have loaded before this function runs
  const GEMINI_KEY = process.env.GEMINI_API_KEY?.trim() || '';

  if (!GEMINI_KEY) {
    throw new HttpError(503, 'AI_SERVICE_UNAVAILABLE', 'GEMINI_API_KEY is missing in environment');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: JSON.stringify(promptJson, null, 2) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
        },
      }),
    },
  );

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new HttpError(503, 'AI_SERVICE_UNAVAILABLE', `Gemini request failed with status ${response.status}: ${errBody}`);
  }

  const data: any = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new HttpError(503, 'AI_SERVICE_UNAVAILABLE', 'Gemini returned an empty response');
  }

  try {
    let cleaned = text.trim();
    // Strip markdown code block wrappers if they exist
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
      cleaned = cleaned.replace(/\s*```$/g, '');
    }
    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
  } catch (err: any) {
    // Fallback: extract the outermost JSON object
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) {
        throw new HttpError(503, 'AI_SERVICE_UNAVAILABLE', `Gemini returned invalid JSON structure: ${err.message}`);
      }
      return JSON.parse(text.slice(start, end + 1));
    } catch (fallbackErr: any) {
      throw new HttpError(503, 'AI_SERVICE_UNAVAILABLE', `Failed to parse Gemini response: ${fallbackErr.message}. Raw: ${text.slice(0, 500)}`);
    }
  }
}
