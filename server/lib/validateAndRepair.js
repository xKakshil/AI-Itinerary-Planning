import { ZodError } from "zod";

import { generateRawTrip } from "./llmClient.js";
import { TripInputSchema } from "../validators/tripSchema.js";

function buildRepairPrompt(originalPrompt, issue, previousResponse) {
  return `${originalPrompt}

Your previous response was invalid.

Previous response:
${previousResponse || "(no valid JSON could be parsed)"}

Issue:
${issue}

Return ONLY corrected JSON that follows the schema exactly.`;
}

export async function validateAndRepair(originalPrompt, preferences = {}) {
  let rawText = "";

  try {
    rawText = await generateRawTrip(originalPrompt, preferences);
    const parsed = JSON.parse(rawText);
    return TripInputSchema.parse(parsed);

  } catch (error) {
    if (!(error instanceof SyntaxError) && !(error instanceof ZodError)) {
      throw error;
    }

    const issue =
      error instanceof ZodError
        ? JSON.stringify(error.issues, null, 2)
        : "The response was not valid JSON.";

    const repairPrompt = buildRepairPrompt(originalPrompt, issue, rawText);

    rawText = await generateRawTrip(repairPrompt, preferences);
    const repaired = JSON.parse(rawText);
    return TripInputSchema.parse(repaired);
  }
}
