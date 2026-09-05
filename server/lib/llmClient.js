import { GoogleGenAI, Type } from "@google/genai";
import { buildSystemPrompt } from "../prompts/tripPrompt.js";
import { retryWithBackoff } from "./retryWithBackoff.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    trip_title: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day_number: { type: Type.NUMBER },
          theme: { type: Type.STRING },
          stops: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                duration_minutes: { type: Type.NUMBER },
                start_time_hint: { type: Type.STRING, nullable: true },
              },
              required: [
                "name",
                "description",
                "category",
                "duration_minutes",
                "start_time_hint",
              ],
            },
          },
        },
        required: ["day_number", "theme", "stops"],
      },
    },
  },
  required: ["trip_title", "days"],
};

// Fresh AbortController/timeout per call — each retry attempt (see
// retryWithBackoff) gets its own full 20s window, not a shared
// countdown that might already be nearly expired.
async function callGemini(systemPrompt, userPrompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `${systemPrompt}\n\nUser Request:\n${userPrompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
      signal: controller.signal,
    });

    return response.text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateRawTrip(userPrompt, preferences = {}) {
  const systemPrompt = buildSystemPrompt(preferences);
  return retryWithBackoff(() => callGemini(systemPrompt, userPrompt));
}