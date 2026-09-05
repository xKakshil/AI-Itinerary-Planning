import { useRef, useCallback } from "react";

import { API_BASE_URL } from "../config/apiConfig";

const API_URL = `${API_BASE_URL}/api/plan`;

const ERROR_MESSAGES = {
  AI_RESPONSE_ERROR: {
    title: "AI response issue",
    message: "The AI returned an invalid itinerary. Please try again.",
  },
  EMPTY_ITINERARY: {
    title: "No itinerary generated",
    message: "Try giving the AI more details.",
  },
  TIMEOUT: {
    title: "Generation timed out",
    message: "The AI took too long to respond.",
  },
  RATE_LIMIT: {
    title: "Rate limit reached",
    message: "Please wait a moment before trying again.",
  },
  AUTH_ERROR: {
    title: "Configuration issue",
    message: "The AI service isn't configured correctly.",
  },
  INVALID_INPUT: {
    title: "Missing prompt",
    message: "Please enter a trip request.",
  },
  NETWORK_ERROR: {
    title: "Network error",
    message: "Couldn't reach the backend server.",
  },
  UNKNOWN_ERROR: {
    title: "Something went wrong",
    message: "Please try again.",
  },
};

export default function useTripActions({ setStatus, setTrip, setError }) {
  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);

  const generateTrip = useCallback(
    async (prompt, preferences = {}) => {
      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      const requestId = ++requestIdRef.current;

      setError(null);
      setStatus("loading");

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, preferences }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (requestId !== requestIdRef.current) return;

        if (!response.ok) {
          throw {
            errorType: data.errorType || "UNKNOWN_ERROR",
            message: data.message,
            details: data.details,
          };
        }

        setTrip(data);
        setStatus("success");

      } catch (error) {
        if (error.name === "AbortError") return;

        const errorType =
          error.errorType || (error instanceof TypeError ? "NETWORK_ERROR" : "UNKNOWN_ERROR");

        setError({
          title: ERROR_MESSAGES[errorType]?.title || ERROR_MESSAGES.UNKNOWN_ERROR.title,
          message:
            ERROR_MESSAGES[errorType]?.message ||
            error.message ||
            ERROR_MESSAGES.UNKNOWN_ERROR.message,
          details: error.details || null,
        });

        setStatus("error");

      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    },
    [setError, setStatus, setTrip]
  );

  const cancelRequest = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return { generateTrip, cancelRequest };
}