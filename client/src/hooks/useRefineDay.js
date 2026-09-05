import { useRef, useState, useCallback } from "react";

import { API_BASE_URL } from "../config/apiConfig";

const API_URL = `${API_BASE_URL}/api/refine`;

export default function useRefineDay({ onError }) {

  const activeRequestsRef = useRef({}); // { [dayId]: requestCounter }
  const [refiningDayIds, setRefiningDayIds] = useState(new Set());

  const refineDay = useCallback(
    async (dayId, context) => {
      const nextCount = (activeRequestsRef.current[dayId] || 0) + 1;
      activeRequestsRef.current[dayId] = nextCount;

      setRefiningDayIds((prev) => new Set(prev).add(dayId));

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(context),
        });

        const data = await response.json();

        if (activeRequestsRef.current[dayId] !== nextCount) return null;

        if (!response.ok) {
          throw { errorType: data.errorType || "UNKNOWN_ERROR", message: data.message };
        }

        return data; // { day_number, theme, stops: [...] }

      } catch (error) {
        if (activeRequestsRef.current[dayId] !== nextCount) return null;
        onError?.(error, dayId);
        return null;

      } finally {
        if (activeRequestsRef.current[dayId] === nextCount) {
          setRefiningDayIds((prev) => {
            const next = new Set(prev);
            next.delete(dayId);
            return next;
          });
        }
      }
    },
    [onError]
  );

  return { refineDay, refiningDayIds };
}