import express from "express";
import { randomUUID } from "crypto";

import { validateAndRepairDay } from "../lib/validateAndRepairDay.js";
import { handleApiError } from "../lib/errorHandler.js";
import { DaySchema } from "../validators/tripSchema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { tripTitle, dayTheme, currentStops, instruction } = req.body;

    if (!instruction?.trim()) {
      return res.status(400).json({
        errorType: "INVALID_INPUT",
        message: "Please describe what you'd like to change.",
      });
    }

    if (!dayTheme || !Array.isArray(currentStops)) {
      return res.status(400).json({
        errorType: "INVALID_INPUT",
        message: "Missing day context to refine.",
      });
    }

    const context = { tripTitle: tripTitle || "", dayTheme, currentStops, instruction };

    const refinedDay = await validateAndRepairDay(context);


    if (refinedDay.stops.length === 0) {
      return res.status(422).json({
        errorType: "EMPTY_ITINERARY",
        message: "That instruction removed every stop. Try being more specific.",
      });
    }


    const stopsWithIds = refinedDay.stops.map((stop) => ({
      ...stop,
      id: randomUUID(),
    }));

    const finalDay = DaySchema.parse({ ...refinedDay, stops: stopsWithIds });

    return res.json(finalDay);

  } catch (error) {
    return handleApiError(error, res);
  }
});

export default router;
