import { Sparkles, Download, CalendarDays, MapPin } from "lucide-react";

export default function TripSidebar({
  tripTitle,
  dayCount,
  stopCount,
  onRegenerateDay,
  isRegenerating,
  onExport,
}) {
  return (
    <aside className="no-print space-y-4">
      {/* Trip identity card — abstract contour-line texture instead of a
          destination photo. A real photo would need a live image-search
          API keyed to the extracted destination, and would look broken
          for any trip that isn't the one it happened to be fetched for;
          this pattern works identically for any generated trip. */}
      <div
        className="relative overflow-hidden rounded-lg border border-[#262b31] p-5"
        style={{
          backgroundColor: "#1c2126",
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0px, transparent 18px, #d4a25311 18px, #d4a25311 19px)",
        }}
      >
        <h3 className="font-headline text-xl font-medium leading-snug text-[#e8e3d8]">
          {tripTitle}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-[#e8e3d8]/60">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-[#e8e3d8]/35" />
            {dayCount} days planned
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#e8e3d8]/35" />
            {stopCount} stops total
          </div>
        </div>
      </div>

      {/* Trip Actions — only real, wired functionality. No Sign in,
          Share, or Delete: none of those exist in this app. */}
      <div className="rounded-lg border border-[#262b31] bg-[#1c2126] p-2">
        <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-[#e8e3d8]/35">
          Trip Actions
        </p>

        <button
          onClick={onRegenerateDay}
          disabled={isRegenerating}
          className="flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-sm text-[#e8e3d8]/75 transition hover:bg-[#242a30] disabled:opacity-40"
        >
          <Sparkles className="h-4 w-4 text-[#d4a253]" />
          {isRegenerating ? "Regenerating current day..." : "Regenerate current day with AI"}
        </button>

        <button
          onClick={onExport}
          className="flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-sm text-[#e8e3d8]/75 transition hover:bg-[#242a30]"
        >
          <Download className="h-4 w-4 text-[#4f7a6b]" />
          Export full itinerary
        </button>
      </div>
    </aside>
  );
}
