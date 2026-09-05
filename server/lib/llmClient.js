import { GoogleGenAI, Type } from "@google/genai";
import { buildSystemPrompt } from "../prompts/tripPrompt.js";

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

function isTransientServerError(error) {
  const status = error.status;
  const messageText = String(error.message || "").toLowerCase();
  return (
    status === 503 ||
    status === 502 ||
    messageText.includes("unavailable") ||
    messageText.includes("overloaded") ||
    messageText.includes("high demand")
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function callGeminiWithOwnTimeout(systemPrompt, userPrompt) {
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

  try {
    return await callGeminiWithOwnTimeout(systemPrompt, userPrompt);
  } catch (error) {

    if (isTransientServerError(error)) {
      await delay(2000);
      return await callGeminiWithOwnTimeout(systemPrompt, userPrompt);
    }
    throw error;
  }
}