import express from "express";
import { randomUUID } from "crypto";

import { validateAndRepairStop } from "../lib/validateAndRepairStop.js";
import { handleApiError } from "../lib/errorHandler.js";
import { StopSchema } from "../validators/tripSchema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { tripTitle, dayTheme, neighborStops, stopToReplace } = req.body;

    if (!stopToReplace?.name || !dayTheme) {
      return res.status(400).json({
        errorType: "INVALID_INPUT",
        message: "Missing stop or day context for replacement.",
      });
    }

    const context = {
      tripTitle: tripTitle || "",
      dayTheme,
      neighborStops: Array.isArray(neighborStops) ? neighborStops : [],
      stopToReplace,
    };

    const replacement = await validateAndRepairStop(context);

    const finalStop = StopSchema.parse({
      ...replacement,
      id: randomUUID(),
    });

    return res.json(finalStop);

  } catch (error) {
    return handleApiError(error, res);
  }
});

export default router;
