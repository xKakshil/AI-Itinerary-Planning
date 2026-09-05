export function buildRefineDayPrompt({ tripTitle, dayTheme, currentStops, instruction, repairNote }) {
  const stopsList = currentStops
    .map((s) => `- ${s.name} (${s.category}, ${s.duration_minutes} min)`)
    .join("\n");

  return `
You are refining ONE day of an existing trip itinerary based on user feedback.

Trip: ${tripTitle}
Current day theme: ${dayTheme}

Current stops for this day:
${stopsList}

User's instruction: "${instruction}"

Apply the user's instruction to this day. You may adjust the theme, add,
remove, reorder, or change stops as needed to satisfy the instruction —
but stay focused on THIS DAY only, and keep the overall spirit of the trip.

Return ONLY valid JSON, no markdown, matching exactly this shape:

{
  "day_number": <keep the same day number>,
  "theme": "string",
  "stops": [
    {
      "name": "string",
      "description": "string",
      "category": "food | sight | activity | transit",
      "duration_minutes": 60,
      "start_time_hint": "09:00 | null"
    }
  ]
}

Never create an "id" field on any stop. Use null instead of guessing an
unknown time.
${repairNote || ""}
`;
}
