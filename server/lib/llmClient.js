import { GoogleGenAI, Type } from "@google/genai";
import { buildSystemPrompt } from "../prompts/tripPrompt.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateRawTrip(userPrompt, preferences = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const systemPrompt = buildSystemPrompt(preferences);

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: `${systemPrompt}

User Request:
${userPrompt}`,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
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
        },
      },

      signal: controller.signal,
    });

    return response.text;
  } finally {
    clearTimeout(timeout);
  }
}