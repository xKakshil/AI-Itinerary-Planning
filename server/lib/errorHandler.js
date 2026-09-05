import { ZodError } from "zod";

function extractStatus(error) {
  return (
    error.status ??
    error.code ??
    error.response?.status ??
    error.cause?.status ??
    null
  );
}

export function handleApiError(error, res) {
  if (process.env.NODE_ENV !== "production") {
    console.error(
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
  } else {
    console.error(error);
  }

  if (error instanceof ZodError) {
    return res.status(422).json({
      errorType: "AI_RESPONSE_ERROR",
      message: "The AI response didn't match the expected format.",
      details: error.issues,
    });
  }

  if (error instanceof SyntaxError) {
    return res.status(422).json({
      errorType: "AI_RESPONSE_ERROR",
      message: "The AI returned a response that couldn't be parsed.",
    });
  }

  if (error.name === "AbortError") {
    return res.status(504).json({
      errorType: "TIMEOUT",
      message: "The AI took too long to respond.",
    });
  }

  const status = extractStatus(error);
  const messageText = String(error.message || "").toLowerCase();

  const isRateLimit =
    status === 429 ||
    messageText.includes("rate limit") ||
    messageText.includes("quota");

  const isAuthError =
    status === 401 ||
    status === 403 ||
    messageText.includes("api key") ||
    messageText.includes("unauthorized");

  if (isRateLimit) {
    return res.status(429).json({
      errorType: "RATE_LIMIT",
      message: "Gemini rate limit reached.",
    });
  }



  if (isAuthError) {
    const authStatus = status === 403 ? 403 : 401;

    return res.status(authStatus).json({
      errorType: "AUTH_ERROR",
      message: "Invalid or unauthorized Gemini API key.",
    });
  }

  const isModelError =
  status === 404 &&
  messageText.includes("model");

if (isModelError) {
  return res.status(500).json({
    errorType: "MODEL_UNAVAILABLE",
    message: "The configured Gemini model is unavailable. Please update the model version.",
  });
}

  return res.status(500).json({
    errorType: "UNKNOWN_ERROR",
    message: "Trip generation failed.",
  });
}