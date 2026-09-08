# AI Trip Planner

Type a trip description in plain English, get back a structured day-by-day itinerary you can actually edit — reorder stops, swap one out, tell it to make a day more relaxed, remove things you don't want. Not a chatbot; the AI returns JSON, the app renders it as an interactive board.

**Live app:** https://ai-itinerary-planning.vercel.app
**Backend:** https://ai-itinerary-planning-server.onrender.com
**Demo:** https://drive.google.com/file/d/1-afA0CECgB9yyTn15YM0JwqYe8XyxQUy/view?usp=drive_link

(Backend is on Render's free tier, kept warm with an UptimeRobot ping every 5 min so it doesn't cold-start on first load.)

## What it does

Type something like "5 days in Kyoto, relaxed pace, food and temples, staying near Gion" and you get a themed day-by-day plan. From there you can:

- Reorder stops (up/down)
- Remove a stop (5-second undo)
- Replace a single stop with an AI-suggested alternative, without regenerating the whole trip
- Tell it to refine a whole day with a plain-text instruction
- See a feasibility badge per day (Comfortable/Busy/Tight) — this is computed locally from stop durations and categories, not something I asked the AI to judge
- Export the itinerary as a PDF
- Works on mobile

## Stack

- React + Vite + Tailwind v4 + Framer Motion (frontend)
- Node/Express (backend)
- Google Gemini (`gemini-3.6-flash`) via `@google/genai`, using `responseSchema` to force structured JSON output
- Zod for server-side validation
- Render (backend) + Vercel (frontend)

## Setup

```bash
git clone https://github.com/xKakshil/AI-Itinerary-Planning.git
cd AI-Itinerary-Planning

cd server
npm install
echo "GEMINI_API_KEY=your_key_here" > .env
echo "PORT=3001" >> .env
npm start

# new terminal
cd client
npm install
npm run dev
```

Get a free key at aistudio.google.com/apikey.

## Architecture, briefly

```
client/src/
  screens/     InputScreen, ItineraryBoard
  components/  StopCard, DayTabs, TripHealth, TripSidebar, ErrorCard,
               UndoToast, RefinementBar, PrintableItinerary
  hooks/       useTripActions, useReplaceStop, useRefineDay, useFeasibility

server/
  routes/      plan.js, replaceStop.js, refineDay.js
  lib/         llmClient.js, retryWithBackoff.js, errorHandler.js,
               validateAndRepair.js (+ per-endpoint variants)
  validators/  Zod schemas
```

A few things I did on purpose:

**Normalized state.** The AI response gets validated then flattened into `daysById` / `stopsById` / `dayOrder` right away, instead of keeping the nested JSON around. Reordering, removing, replacing — all of it becomes a lookup by ID instead of walking arrays. Makes Replace Stop and Refine Day cheap: they're just patching one entry in a table.

**Per-request-scope tracking, not one global ID.** A single `requestId` only protects the main "generate trip" flow. It doesn't help if you click Replace on one stop and Refine on a different day at the same time — those need independent staleness checks. `useReplaceStop` tracks by `stopId`, `useRefineDay` tracks by `dayId`. A response that's been superseded gets dropped silently, without blocking unrelated stuff.

**Server never trusts the model's IDs.** Gemini is told explicitly not to generate IDs; the server assigns fresh UUIDs after validation. Found out early why this matters — letting the model make up its own IDs led to collisions across days.

## Handling bad output

This is the part the assignment cares about most, so here's what's actually covered:

- Malformed JSON → caught, one repair attempt (feeds the parse error back to the model), then a clear error if that fails too
- Wrong shape / fails schema → same repair path, using the actual Zod error as feedback
- Empty result → explicit check after validation, different message than a generic failure
- Slow/hanging request → 20s timeout per attempt
- Gemini returning a 503 (happened for real during testing — the model was overloaded) → classified separately, 2 retries with backoff (2s, then 4s), applied the same way across trip generation, Replace Stop, and Refine Day
- Deprecated model name → also hit this for real when `gemini-2.5-flash` got retired for new users mid-project, had to migrate everything to `gemini-3.6-flash`
- Rate limit / bad API key → distinct error types, not lumped together
- Backend unreachable → caught client-side as a network error, separate from a backend-reported one
- Stale responses overwriting newer ones → the per-scope tracking above
- Two concurrent Replace Stop calls independently suggesting the same alternative — this one I didn't expect. Two AI calls in flight at once can't see each other's pending answer, so they can land on the same suggestion by coincidence. Fixed by checking the incoming result against live state (via refs, not whatever was in scope when the request started) and rejecting it if it's a duplicate.

## AI usage note

Used Claude through most of this — scaffolding the Zod schemas and Gemini schema config, working through the retry/repair design, and debugging as things came up. A few real bugs surfaced this way rather than being theoretical: an ES module ordering issue where `dotenv.config()` ran after something had already tried to read the env var it was supposed to set, a Tailwind grid class that used a comma instead of a space and silently produced invalid CSS, and the concurrent-replace race condition above. All of it got tested against the real API before I trusted it — a couple of early suggestions turned out to be wrong (or in one case, I flagged something as wrong that actually wasn't, since a newer Gemini model had shipped after my own knowledge was current) and got corrected once I actually ran it.

## Known limitations

- Feasibility score is a heuristic (duration + category balance + a penalty for too many similar stops in a row), not real travel-time or distance data.
- No real booking data — deliberately never lets the AI invent specific hotel names or prices. Optional trip preferences (dates, pace, area) only inform which stops make sense.
- If you Replace a stop and Refine the same day at the same time, the day-level refine wins and overwrites the replace. Each is safe on its own; I didn't resolve the interaction between the two since it's a narrow edge case.
- No save/reload — refreshing loses your current trip.
- No streaming — full response comes back at once.
- Free-tier Gemini rate limits are fairly low, so heavy back-to-back testing can occasionally trigger a rate-limit or overload response. Both are handled with a clear message and a retry, which is the actual behavior the assignment is asking for.

## What I'd do with more time

- Drag-and-drop reordering (skipped on purpose — up/down buttons cover the requirement without the mobile touch-conflict headaches)
- Save/reload sessions
- Streaming responses
- Fix the Replace/Refine same-day conflict properly
