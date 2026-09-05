import { useState } from "react";
import {
  Utensils,
  Landmark,
  Compass,
  Train,
  Clock3,
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";

const CATEGORY = {
  food: { icon: Utensils, color: "#d4a253" },
  sight: { icon: Landmark, color: "#4f7a6b" },
  activity: { icon: Compass, color: "#5b85a6" },
  transit: { icon: Train, color: "#8a7f94" },
};

export default function StopCard({
  stop,
  index,
  totalStops,
  onRemove,
  onMoveUp,
  onMoveDown,
  onReplace,
  isReplacing,
}) {
  const [expanded, setExpanded] = useState(false);
  const { icon: Icon, color } = CATEGORY[stop.category] || CATEGORY.activity;
  const confirmed = Boolean(stop.start_time_hint);

  if (isReplacing) {
    return (
      <div className="flex overflow-hidden rounded-lg border border-[#262b31] bg-[#1c2126]">
        <div className="w-1.5 shrink-0 animate-pulse bg-[#e8e3d8]/10" />
        <div className="flex-1 animate-pulse p-4">
          <div className="mb-2 h-3.5 w-1/3 rounded bg-[#e8e3d8]/10" />
          <div className="h-2.5 w-1/2 rounded bg-[#e8e3d8]/5" />
          <p className="mt-3 text-xs text-[#e8e3d8]/30">Finding an alternative...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden rounded-lg border border-[#262b31] bg-[#1c2126]">
      <div className="w-1.5 shrink-0" style={{ backgroundColor: color }} />

      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />

            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-medium text-[#e8e3d8]">{stop.name}</h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#e8e3d8]/45">
                <span className="flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {stop.duration_minutes} min
                </span>
                <span>{stop.start_time_hint || "Time flexible"}</span>
                <span
                  className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: confirmed ? "#4f7a6b22" : "#d4a25322",
                    color: confirmed ? "#7ba796" : "#d4a253",
                  }}
                >
                  {confirmed ? "Confirmed" : "Estimated"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse details" : "Expand details"}
            className="shrink-0 text-[#e8e3d8]/40 hover:text-[#e8e3d8]"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {expanded && (
          <p className="mt-3 text-sm leading-relaxed text-[#e8e3d8]/60">{stop.description}</p>
        )}

        {/* Tear line before the action row. flex-wrap + row-gap here so that
            on very narrow screens (~320px) the four controls wrap onto a
            second line instead of overflowing the card or forcing
            horizontal scroll on the page. */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-[#262b31] pt-3">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move stop up"
            className="rounded border border-[#262b31] p-1.5 text-[#e8e3d8]/50 transition hover:border-[#e8e3d8]/30 hover:text-[#e8e3d8] disabled:opacity-20"
          >
            <ArrowUp size={15} />
          </button>

          <button
            onClick={onMoveDown}
            disabled={index === totalStops - 1}
            aria-label="Move stop down"
            className="rounded border border-[#262b31] p-1.5 text-[#e8e3d8]/50 transition hover:border-[#e8e3d8]/30 hover:text-[#e8e3d8] disabled:opacity-20"
          >
            <ArrowDown size={15} />
          </button>

          <button
            onClick={onReplace}
            aria-label="Replace this stop"
            className="flex items-center gap-1.5 rounded border border-[#4f7a6b]/30 px-3 py-1.5 text-xs font-medium text-[#7ba796] transition hover:bg-[#4f7a6b]/10"
          >
            <RefreshCw size={13} />
            {/* Label hides below sm to keep the row compact on narrow
                screens; the icon + aria-label still carry the meaning. */}
            <span className="hidden sm:inline">Replace</span>
          </button>

          <button
            onClick={onRemove}
            aria-label="Remove this stop"
            className="ml-auto rounded border border-[#c4574b]/30 p-1.5 text-[#c4574b] transition hover:bg-[#c4574b]/10"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}