// Shared transient-error retry logic, used by every Gemini-calling
// client (trip generation, Replace Stop, Refine Day) so all three get
// identical, tested protection against Google's servers being
// temporarily overloaded — rather than only the main generation path
// having it, which was the gap that caused this exact failure to be
// unprotected on Replace/Refine.

export function isTransientServerError(error) {
  const status = error.status;
  const messageText = String(error.message || "").toLowerCase();
  return (
    status === 503 ||
    status === 502 ||
    messageText.includes("unavailable") ||
    messageText.includes("overloaded") ||
    messageText.includes("high demand")
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Calls `attemptFn` (a function with no arguments that returns a
// promise — wrap your real call in a closure). On a transient 503/502,
// retries up to `maxRetries` times with increasing delay (2s, 4s, ...).
// Any other error is thrown immediately, unretried.
export async function retryWithBackoff(attemptFn, maxRetries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await attemptFn();
    } catch (error) {
      lastError = error;

      if (!isTransientServerError(error) || attempt === maxRetries) {
        throw error;
      }

      const waitMs = 2000 * (attempt + 1); // 2s, then 4s
      await delay(waitMs);
    }
  }

  throw lastError;
}