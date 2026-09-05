import { ZodError } from "zod";

import { generateRawReplacementStop } from "./replaceStopClient.js";
import { ReplacementStopSchema } from "../validators/replaceStopSchema.js";

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

export async function validateAndRepairStop(context) {
  let rawText = "";

  try {
    rawText = await generateRawReplacementStop(context);
    const parsed = JSON.parse(rawText);
    return ReplacementStopSchema.parse(parsed);

  } catch (error) {

    if (!(error instanceof SyntaxError) && !(error instanceof ZodError)) {
      throw error;
    }

    const issue =
      error instanceof ZodError
        ? JSON.stringify(error.issues, null, 2)
        : "The response was not valid JSON.";

    const repairContext = buildRepairContext(context, issue, rawText);

    rawText = await generateRawReplacementStop(repairContext);
    const repaired = JSON.parse(rawText);
    return ReplacementStopSchema.parse(repaired); 
  }
}
