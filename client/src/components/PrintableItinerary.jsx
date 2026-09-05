export default function PrintableItinerary({ tripTitle, dayOrder, daysById, stopsById }) {
  return (
    <div className="print-only px-8 py-6 text-black">
      <h1 className="text-3xl font-bold">{tripTitle}</h1>

      {dayOrder.map((dayId) => {
        const day = daysById[dayId];
        return (
          <div key={dayId} className="mt-6 break-inside-avoid">
            <h2 className="text-xl font-semibold">
              Day {day.day_number}: {day.theme}
            </h2>

            <ul className="mt-2 space-y-2">
              {day.stopIds.map((stopId) => {
                const stop = stopsById[stopId];
                return (
                  <li key={stopId} className="border-b border-gray-300 pb-2">
                    <div className="font-medium">{stop.name}</div>
                    <div className="text-sm text-gray-600">
                      {stop.category} · {stop.duration_minutes} min
                      {stop.start_time_hint ? ` · ${stop.start_time_hint}` : ""}
                    </div>
                    <div className="mt-1 text-sm">{stop.description}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
