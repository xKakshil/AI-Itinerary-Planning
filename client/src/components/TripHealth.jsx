import { CalendarDays, MapPin, CheckCircle, AlertTriangle } from "lucide-react";

export default function TripHealth({
  dayCount,
  stopCount,
  comfortableCount,
  busyCount,
  tightCount,
}) {
  let paceLabel = "Comfortable pace";
  let PaceIcon = CheckCircle;
  let paceColor = "#7ba796";

  if (tightCount > 0) {
    paceLabel = `${tightCount} tight day${tightCount > 1 ? "s" : ""}`;
    PaceIcon = AlertTriangle;
    paceColor = "#c4574b";
  } else if (busyCount > 0) {
    paceLabel = `${busyCount} busy day${busyCount > 1 ? "s" : ""}`;
    PaceIcon = AlertTriangle;
    paceColor = "#d4a253";
  }

  return (
    <div className="rounded-lg border border-t-2 border-[#262b31] border-t-[#d4a253]/65 bg-[#1c2126] px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#e8e3d8]/70">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#e8e3d8]/40" />
          <span>{dayCount} days</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#e8e3d8]/40" />
          <span>{stopCount} stops</span>
        </div>
        <div className="flex items-center gap-2" style={{ color: paceColor }}>
          <PaceIcon className="h-4 w-4" />
          <span>{paceLabel}</span>
        </div>
      </div>
    </div>
  );
}