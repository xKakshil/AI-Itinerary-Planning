import { ZodError } from "zod";

import { generateRawDayRefinement } from "./refineDayClient.js";
import { DayInputSchema } from "../validators/tripSchema.js";

function buildRepairContext(context, issue, previousResponse) {
  return {
    ...context,
    repairNote: `
Your previous response was invalid.

Previous response:
${previousResponse || "(no valid JSON could be parsed)"}

Issue:
${issue}

Return ONLY corrected JSON that follows the schema exactly.`,
  };
}

export async function validateAndRepairDay(context) {
  let rawText = "";

  try {
    rawText = await generateRawDayRefinement(context);
    const parsed = JSON.parse(rawText);
    return DayInputSchema.parse(parsed);

  } catch (error) {

    if (!(error instanceof SyntaxError) && !(error instanceof ZodError)) {
      throw error;
    }

    const issue =
      error instanceof ZodError
        ? JSON.stringify(error.issues, null, 2)
        : "The response was not valid JSON.";

    const repairContext = buildRepairContext(context, issue, rawText);

    rawText = await generateRawDayRefinement(repairContext);
    const repaired = JSON.parse(rawText);
    return DayInputSchema.parse(repaired); // if this also fails, let it bubble up
  }
}
