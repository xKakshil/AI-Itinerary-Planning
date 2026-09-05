import { z } from "zod";

/* -----------------------------
   Gemini Output (No IDs)
------------------------------ */

export const StopInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["food", "sight", "activity", "transit"]),
  duration_minutes: z.number().positive(),
  start_time_hint: z.string().nullable(),
});

export const DayInputSchema = z.object({
  day_number: z.number().positive(),
  theme: z.string().min(1),
  stops: z.array(StopInputSchema),
});

export const TripInputSchema = z.object({
  trip_title: z.string().min(1),
  days: z.array(DayInputSchema),
});

/* -----------------------------
   Internal App Shape (With IDs)
------------------------------ */

export const StopSchema = StopInputSchema.extend({
  id: z.uuid(),
});

export const DaySchema = DayInputSchema.extend({
  stops: z.array(StopSchema),
});

export const TripSchema = z.object({
  trip_title: z.string(),
  days: z.array(DaySchema),
});