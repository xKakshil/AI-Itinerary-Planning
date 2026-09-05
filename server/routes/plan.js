import express from "express";
import { randomUUID } from "crypto";

import { validateAndRepair } from "../lib/validateAndRepair.js";
import { handleApiError } from "../lib/errorHandler.js";
import { TripSchema } from "../validators/tripSchema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt, preferences } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({
        errorType: "INVALID_INPUT",
        message: "Prompt is required.",
      });
    }


    const safePreferences = preferences && typeof preferences === "object" ? preferences : {};

    const validatedTrip = await validateAndRepair(prompt, safePreferences);

    const totalStops = validatedTrip.days.reduce((sum, day) => sum + day.stops.length, 0);

    if (validatedTrip.days.length === 0 || totalStops === 0) {
      return res.status(422).json({
        errorType: "EMPTY_ITINERARY",
        message: "The AI couldn't generate stops for this request. Try adding more detail.",
      });
    }

    validatedTrip.days.forEach((day) => {
      day.stops.forEach((stop) => {
        stop.id = randomUUID();
      });
    });

    const finalTrip = TripSchema.parse(validatedTrip);

    return res.json(finalTrip);

  } catch (error) {
    return handleApiError(error, res);
  }
});

export default router;
