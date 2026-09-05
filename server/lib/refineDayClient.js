import { GoogleGenAI, Type } from "@google/genai";
import { buildRefineDayPrompt } from "../prompts/refineDayPrompt.js";
 
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
 
const DAY_RESPONSE_SCHEMA = {
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
        required: ["name", "description", "category", "duration_minutes", "start_time_hint"],
      },
    },
  },
  required: ["day_number", "theme", "stops"],
};
 
export async function generateRawDayRefinement(context) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
 
  try {
    const prompt = buildRefineDayPrompt(context);
 
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: DAY_RESPONSE_SCHEMA,
      },
      signal: controller.signal,
    });
 

    return response.text;
  } finally {
    clearTimeout(timeout);
  }
}