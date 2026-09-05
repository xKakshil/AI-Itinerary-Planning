import { useRef, useState, useCallback } from "react";

import { API_BASE_URL } from "../config/apiConfig";

const API_URL = `${API_BASE_URL}/api/stop/replace`;

export default function useReplaceStop({ onError }) {

  const activeRequestsRef = useRef({}); // { [stopId]: requestCounter }
  const [replacingIds, setReplacingIds] = useState(new Set());

  const replaceStop = useCallback(
    async (stopId, context) => {
      const nextCount = (activeRequestsRef.current[stopId] || 0) + 1;
      activeRequestsRef.current[stopId] = nextCount;

      setReplacingIds((prev) => new Set(prev).add(stopId));

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(context),
        });

        const data = await response.json();

        // A newer replace request for this same stopId has since started —
        // this response is stale, discard it.
        if (activeRequestsRef.current[stopId] !== nextCount) return null;

        if (!response.ok) {
          throw { errorType: data.errorType || "UNKNOWN_ERROR", message: data.message };
        }

        return data; // the full new stop object; caller applies it

      } catch (error) {
        if (activeRequestsRef.current[stopId] !== nextCount) return null;
        onError?.(error, stopId);
        return null;

      } finally {
        if (activeRequestsRef.current[stopId] === nextCount) {
          setReplacingIds((prev) => {
            const next = new Set(prev);
            next.delete(stopId);
            return next;
          });
        }
      }
    },
    [onError]
  );

  return { replaceStop, replacingIds };
}