import { useMemo } from "react";


export function computeFeasibility(day, stopsById) {
  const stops = day.stopIds.map((id) => stopsById[id]);

  if (stops.length === 0) {
    return { score: 0, label: "No stops", color: "text-[#e8e3d8]/30", totalMinutes: 0 };
  }

  const totalMinutes = stops.reduce((sum, stop) => sum + stop.duration_minutes, 0);

  let score = 0;

  // Duration
  if (totalMinutes < 360) score += 2;
  else if (totalMinutes > 480) score -= 2;

  // Category balance: no single category should dominate more than 60% of the day
  const categoryCounts = {};
  stops.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });
  const maxShare = Math.max(...Object.values(categoryCounts)) / stops.length;
  if (maxShare <= 0.6) score += 1;

  // Consecutive same-category penalty
  let consecutive = 1;
  for (let i = 1; i < stops.length; i++) {
    if (stops[i].category === stops[i - 1].category) {
      consecutive++;
      if (consecutive > 3) {
        score -= 1;
        break;
      }
    } else {
      consecutive = 1;
    }
  }

  let label = "Comfortable";
  let color = "text-[#7ba796]";

  if (score <= 0) {
    label = "Tight";
    color = "text-[#c4574b]";
  } else if (score <= 2) {
    label = "Busy";
    color = "text-[#d4a253]";
  }

  return { score, label, color, totalMinutes };
}

// Hook wrapper — use this inside a component rendering a SINGLE day
// (e.g. the active day's detail view). Do not call this in a .map() loop;
// use computeFeasibility directly for aggregates instead.
export default function useFeasibility(day, stopsById) {
  return useMemo(() => computeFeasibility(day, stopsById), [day, stopsById]);
}
