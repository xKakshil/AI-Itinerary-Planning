import { z } from "zod";
import { StopInputSchema } from "./tripSchema.js";

// A replacement is just one stop, same shape Gemini already produces.
export const ReplacementStopSchema = StopInputSchema;
