import { GoogleGenAI, Type } from "@google/genai";
import { buildReplacePrompt } from "../prompts/replaceStopPrompt.js";
import { retryWithBackoff } from "./retryWithBackoff.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const STOP_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    category: { type: Type.STRING },
    duration_minutes: { type: Type.NUMBER },
    start_time_hint: { type: Type.STRING, nullable: true },
  },
  required: ["name", "description", "category", "duration_minutes", "start_time_hint"],
};

async function callGemini(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: STOP_RESPONSE_SCHEMA,
      },
      signal: controller.signal,
    });

    return response.text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateRawReplacementStop(context) {
  const prompt = buildReplacePrompt(context);
  return retryWithBackoff(() => callGemini(prompt));
}