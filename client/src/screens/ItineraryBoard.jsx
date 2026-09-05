import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import DayTabs from "../components/DayTabs";
import StopCard from "../components/StopCard";
import TripHealth from "../components/TripHealth";
import UndoToast from "../components/UndoToast";
import RefinementBar from "../components/RefinementBar";
import useNormalizedTrip from "../hooks/useNormalizedTrip";
import { computeFeasibility } from "../hooks/useFeasibility";
import useReplaceStop from "../hooks/useReplaceStop";
import useRefineDay from "../hooks/useRefineDay";
import TripSidebar from "../components/TripSidebar";
import PrintableItinerary from "../components/PrintableItinerary";


export default function ItineraryBoard({ trip, onStartOver }) {
  const normalized = useNormalizedTrip(trip);

  const [daysById, setDaysById] = useState(normalized.daysById);
  const [stopsById, setStopsById] = useState(normalized.stopsById);
  const [dayOrder] = useState(normalized.dayOrder);

  const [activeDayId, setActiveDayId] = useState(normalized.dayOrder[0]);
  const [undoState, setUndoState] = useState(null);
  const [replaceError, setReplaceError] = useState(null);
  const [refineError, setRefineError] = useState(null);

  const undoTimerRef = useRef(null);

  // Refs mirroring the LATEST committed state. Needed because async
  // callbacks (handleReplace, handleRefine) close over whatever daysById/
  // stopsById were at the moment they were invoked — if two operations
  // are in flight concurrently, that closure can be stale by the time
  // the response comes back. Reading .current always gets the true
  // current state, regardless of which render created the callback.
  const daysByIdRef = useRef(daysById);
  const stopsByIdRef = useRef(stopsById);

  useEffect(() => {
    daysByIdRef.current = daysById;
  }, [daysById]);

  useEffect(() => {
    stopsByIdRef.current = stopsById;
  }, [stopsById]);

  const { replaceStop, replacingIds } = useReplaceStop({
    onError: (error, stopId) => {
      setReplaceError({
        stopId,
        message: error.message || "Couldn't find a replacement. Try again.",
      });
      setTimeout(() => setReplaceError(null), 4000);
    },
  });

  const { refineDay, refiningDayIds } = useRefineDay({
    onError: (error) => {
      setRefineError(error.message || "Couldn't apply that change. Try again.");
      setTimeout(() => setRefineError(null), 4000);
    },
  });

  const activeDay = daysById[activeDayId];

  if (!activeDay) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#12161a] text-[#e8e3d8]">
        <p>No active itinerary found.</p>
      </div>
    );
  }

  const activeDayHealth = computeFeasibility(activeDay, stopsById);
  const stopCount = Object.keys(stopsById).length;

  const dayResults = dayOrder.map((id) =>
    computeFeasibility(daysById[id], stopsById),
  );
  const comfortableCount = dayResults.filter(
    (d) => d.label === "Comfortable",
  ).length;
  const busyCount = dayResults.filter((d) => d.label === "Busy").length;
  const tightCount = dayResults.filter((d) => d.label === "Tight").length;

  function removeStop(dayId, stopId) {
    const removedIndex = daysById[dayId].stopIds.indexOf(stopId);

    setUndoState({ dayId, stopId, index: removedIndex });

    setDaysById((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        stopIds: prev[dayId].stopIds.filter((id) => id !== stopId),
      },
    }));

    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setUndoState(null);
      undoTimerRef.current = null;
    }, 5000);
  }

  function undoRemove() {
    if (!undoState) return;
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = null;

    const { dayId, stopId, index } = undoState;

    setDaysById((prev) => {
      const ids = [...prev[dayId].stopIds];
      ids.splice(index, 0, stopId);
      return { ...prev, [dayId]: { ...prev[dayId], stopIds: ids } };
    });

    setUndoState(null);
  }

  function moveStop(dayId, stopId, direction) {
    setDaysById((prev) => {
      const day = prev[dayId];
      const ids = [...day.stopIds];
      const index = ids.indexOf(stopId);
      const target = direction === "up" ? index - 1 : index + 1;

      if (target < 0 || target >= ids.length) return prev;

      [ids[index], ids[target]] = [ids[target], ids[index]];
      return { ...prev, [dayId]: { ...day, stopIds: ids } };
    });
  }

  async function handleReplace(dayId, stopId) {
    const day = daysById[dayId];
    const stop = stopsById[stopId];
    const neighborStops = day.stopIds
      .filter((id) => id !== stopId)
      .map((id) => stopsById[id]);

    const newStop = await replaceStop(stopId, {
      tripTitle: normalized.trip_title,
      dayTheme: day.theme,
      neighborStops,
      stopToReplace: stop,
    });

    if (!newStop) return;

    const liveDay = daysByIdRef.current[dayId];
    const liveStopsById = stopsByIdRef.current;

    const isDuplicate = liveDay.stopIds
      .filter((id) => id !== stopId)
      .some(
        (id) =>
          liveStopsById[id]?.name.toLowerCase() === newStop.name.toLowerCase(),
      );

    if (isDuplicate) {
      setReplaceError({
        stopId,
        message: `"${newStop.name}" is already on this day. Try Replace again for a different suggestion.`,
      });
      setTimeout(() => setReplaceError(null), 4000);
      return;
    }

    setStopsById((prev) => {
      const { [stopId]: _old, ...rest } = prev;
      return { ...rest, [newStop.id]: newStop };
    });

    setDaysById((prev) => {
      const ids = prev[dayId].stopIds.map((id) =>
        id === stopId ? newStop.id : id,
      );
      return { ...prev, [dayId]: { ...prev[dayId], stopIds: ids } };
    });
  }

  async function handleRefine(instruction) {
    const dayId = activeDayId;
    const day = daysById[dayId];

    const currentStops = day.stopIds.map((id) => {
      const s = stopsById[id];
      return {
        name: s.name,
        category: s.category,
        duration_minutes: s.duration_minutes,
      };
    });

    const refinedDay = await refineDay(dayId, {
      tripTitle: normalized.trip_title,
      dayTheme: day.theme,
      currentStops,
      instruction,
    });

    if (!refinedDay) return; // failed — onError already handled it

    // A day refine is a full replacement of that day's content, not a
    // patch — so we don't need the duplicate-name check Replace Stop
    // uses (that check exists specifically for two independent
    // single-stop replacements coincidentally converging; here the
    // whole day is intentionally regenerated as one unit).
    setStopsById((prev) => {
      const next = { ...prev };
      // Remove the old stops that belonged to this day only.
      daysByIdRef.current[dayId].stopIds.forEach((oldId) => {
        delete next[oldId];
      });
      refinedDay.stops.forEach((stop) => {
        next[stop.id] = stop;
      });
      return next;
    });

    setDaysById((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        theme: refinedDay.theme,
        stopIds: refinedDay.stops.map((s) => s.id),
      },
    }));
  }

  return (
    <div className="min-h-screen bg-[#12161a] text-[#e8e3d8]">
      <main className="no-print mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-4xl font-medium">
              {normalized.trip_title}
            </h1>
            <p className="mt-2 text-[#e8e3d8]/50">
              Edit your itinerary anytime.
            </p>
          </div>

          <button
            onClick={onStartOver}
            className="rounded border border-[#262b31] px-5 py-2.5 text-sm text-[#e8e3d8]/70 transition hover:bg-[#1c2126]"
          >
            New Trip
          </button>
        </div>

        <TripHealth
          dayCount={dayOrder.length}
          stopCount={stopCount}
          comfortableCount={comfortableCount}
          busyCount={busyCount}
          tightCount={tightCount}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            <DayTabs
              dayOrder={dayOrder}
              daysById={daysById}
              activeDayId={activeDayId}
              onChange={setActiveDayId}
            />

            <div className="rounded-lg border border-t-0 border-[#262b31] bg-[#1c2126] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-2xl font-medium">
                    Day {activeDay.day_number}
                  </h2>
                  <p className="text-[#e8e3d8]/50">{activeDay.theme}</p>
                </div>

                <span
                  className={`rounded border border-[#262b31] px-3 py-1.5 text-sm ${activeDayHealth.color}`}
                >
                  {activeDayHealth.label}
                </span>
              </div>

              <div className="space-y-4">
                {activeDay.stopIds.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[#262b31] p-6 text-center text-[#e8e3d8]/30">
                    No stops left for this day.
                  </p>
                ) : (
                  <AnimatePresence initial={false}>
                    {activeDay.stopIds.map((stopId, index) => (
                      <motion.div
                        key={stopId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <StopCard
                          stop={stopsById[stopId]}
                          index={index}
                          totalStops={activeDay.stopIds.length}
                          isReplacing={replacingIds.has(stopId)}
                          onRemove={() => removeStop(activeDayId, stopId)}
                          onMoveUp={() => moveStop(activeDayId, stopId, "up")}
                          onMoveDown={() => moveStop(activeDayId, stopId, "down")}
                          onReplace={() => handleReplace(activeDayId, stopId)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <RefinementBar
                onSubmit={handleRefine}
                isRefining={refiningDayIds.has(activeDayId)}
              />
            </div>
          </div>

          <TripSidebar
            tripTitle={normalized.trip_title}
            dayCount={dayOrder.length}
            stopCount={stopCount}
            onRegenerateDay={() =>
              handleRefine(
                "Come up with a completely fresh set of stops for this day, keeping the same theme and pace.",
              )
            }
            isRegenerating={refiningDayIds.has(activeDayId)}
            onExport={() => window.print()}
          />
        </div>
      </main>

      <PrintableItinerary
        tripTitle={normalized.trip_title}
        dayOrder={dayOrder}
        daysById={daysById}
        stopsById={stopsById}
      />

      <UndoToast visible={Boolean(undoState)} onUndo={undoRemove} />

      {replaceError && (
        <div className="fixed bottom-8 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg border border-[#c4574b]/25 bg-[#1c2126] px-5 py-4 text-sm text-[#e8b3ac] shadow-2xl break-words">
          {replaceError.message}
        </div>
      )}

      {refineError && (
        <div className="fixed bottom-8 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg border border-[#c4574b]/25 bg-[#1c2126] px-5 py-4 text-sm text-[#e8b3ac] shadow-2xl break-words">
          {refineError}
        </div>
      )}
    </div>
  );
}