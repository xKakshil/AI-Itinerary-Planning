import { useMemo } from "react";

export default function useNormalizedTrip(trip) {
  return useMemo(() => {
    const daysById = {};
    const stopsById = {};
    const dayOrder = [];

    trip.days.forEach((day) => {
      const dayId = `day-${day.day_number}`;

      dayOrder.push(dayId);

      daysById[dayId] = {
        id: dayId,
        day_number: day.day_number,
        theme: day.theme,
        stopIds: [],
      };

      day.stops.forEach((stop) => {
        stopsById[stop.id] = stop;
        daysById[dayId].stopIds.push(stop.id);
      });
    });

    return {
      trip_title: trip.trip_title,
      dayOrder,
      daysById,
      stopsById,
    };
  }, [trip]);
}