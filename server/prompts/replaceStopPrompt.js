export function buildReplacePrompt({ tripTitle, dayTheme, neighborStops, stopToReplace, repairNote }) {
  const neighborList = neighborStops
    .map((s) => `- ${s.name} (${s.category}, ${s.duration_minutes} min)`)
    .join("\n");

  return `
You are helping refine a single stop in an existing trip itinerary.

Trip: ${tripTitle}
Day theme: ${dayTheme}

Other stops already planned for this day (do not duplicate these):
${neighborList || "(none)"}

The user wants to replace this stop:
- Name: ${stopToReplace.name}
- Category: ${stopToReplace.category}
- Duration: ${stopToReplace.duration_minutes} min

Suggest ONE alternative stop that fits the same day theme and is a similar
duration and category (unless a different category clearly fits better).
Do not repeat any of the other stops already listed for this day.

Return ONLY valid JSON, no markdown, matching exactly this shape:

{
  "name": "string",
  "description": "string",
  "category": "food | sight | activity | transit",
  "duration_minutes": 60,
  "start_time_hint": "09:00 | null"
}

Never create an "id" field. Use null instead of guessing an unknown time.
${repairNote || ""}
`;
}
