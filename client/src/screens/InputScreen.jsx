import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ErrorCard from "../components/ErrorCard";

const examples = [
  "5 days in Kyoto with food and temples",
  "4 days in Paris on a budget",
  "Weekend in Goa with friends",
  "7 days in Italy for couples",
];

const PACE_OPTIONS = ["Relaxed", "Balanced", "Packed"];

const LOADING_STAGES = [
  "Understanding your trip...",
  "Planning each day...",
  "Balancing your itinerary...",
  "Almost ready...",
];

export default function InputScreen({
  prompt,
  setPrompt,
  status,
  error,
  onGenerate,
  onRetry,
  onCancel,
}) {
  const [loadingText, setLoadingText] = useState(LOADING_STAGES[0]);
  const [showDetails, setShowDetails] = useState(false);
  const [dates, setDates] = useState("");
  const [pace, setPace] = useState("");
  const [stayArea, setStayArea] = useState("");

  useEffect(() => {
    if (status !== "loading") {
      setLoadingText(LOADING_STAGES[0]);
      return;
    }
    let index = 0;
    const interval = setInterval(() => {
      index = Math.min(index + 1, LOADING_STAGES.length - 1);
      setLoadingText(LOADING_STAGES[index]);
    }, 6000);
    return () => clearInterval(interval);
  }, [status]);

  function buildPreferences() {
    const preferences = {};
    if (dates.trim()) preferences.dates = dates.trim();
    if (pace) preferences.pace = pace;
    if (stayArea.trim()) preferences.stayArea = stayArea.trim();
    return preferences;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim() || status === "loading") return;
    onGenerate(prompt, buildPreferences());
  }

  return (
    <div className="relative min-h-screen bg-[#12161a] text-[#e8e3d8]">
      {/* Restrained warm glow — one soft light source, not a bright gradient blob */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#d4a253]/[0.07] blur-[140px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
        {/* Passport-stamp badge instead of a glowing pill */}
        <div className="mb-8 -rotate-1 rounded border border-[#d4a253]/40 px-4 py-1.5 text-xs uppercase tracking-wider text-[#d4a253]">
          AI Itinerary Planning
        </div>

        <h1 className="font-headline max-w-2xl text-center text-5xl font-medium leading-[1.1] md:text-6xl">
          Plan trips in seconds.
          <br />
          <span className="italic">Edit them like a pro.</span>
        </h1>

        <p className="mt-6 max-w-lg text-center text-[15px] leading-relaxed text-[#e8e3d8]/60">
          Describe your trip naturally and get a structured day-by-day
          itinerary you can refine, reorder, and personalize.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-12 w-full rounded-xl border border-[#262b31] bg-[#1c2126]"
        >
          <div className="p-6">
            <textarea
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              readOnly={status === "loading"}
              placeholder="Try: 5 days in Kyoto, relaxed pace, love food and temples, staying near Gion..."
              rows={4}
              className={`w-full resize-none bg-transparent text-[15px] leading-relaxed text-[#e8e3d8] placeholder:text-[#e8e3d8]/30 outline-none transition-opacity ${
                status === "loading" ? "opacity-60" : ""
              }`}
            />

            {status === "idle" && (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {examples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setPrompt(example)}
                      className="rounded border border-[#262b31] px-3 py-1.5 text-xs text-[#e8e3d8]/50 transition hover:border-[#d4a253]/50 hover:text-[#e8e3d8]"
                    >
                      {example}
                    </button>
                  ))}
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setShowDetails((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-[#e8e3d8]/40 hover:text-[#e8e3d8]/70"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`}
                    />
                    Add details (optional)
                  </button>

                  {showDetails && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <input
                        type="text"
                        value={dates}
                        onChange={(e) => setDates(e.target.value)}
                        placeholder="Dates (e.g. mid-March)"
                        className="rounded border border-[#262b31] bg-[#12161a] px-3 py-2 text-sm text-[#e8e3d8] placeholder:text-[#e8e3d8]/30 outline-none focus:border-[#d4a253]/50"
                      />
                      <select
                        value={pace}
                        onChange={(e) => setPace(e.target.value)}
                        className="rounded border border-[#262b31] bg-[#12161a] px-3 py-2 text-sm text-[#e8e3d8] outline-none focus:border-[#d4a253]/50"
                      >
                        <option value="" className="bg-[#12161a]">Pace (any)</option>
                        {PACE_OPTIONS.map((p) => (
                          <option key={p} value={p} className="bg-[#12161a]">{p}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={stayArea}
                        onChange={(e) => setStayArea(e.target.value)}
                        placeholder="Area to stay (e.g. near Gion)"
                        className="rounded border border-[#262b31] bg-[#12161a] px-3 py-2 text-sm text-[#e8e3d8] placeholder:text-[#e8e3d8]/30 outline-none focus:border-[#d4a253]/50"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {status === "loading" && (
              <div className="mt-5 space-y-3">
                {/* Day-header hint — abstract placeholder bars only, no
                    invented text, since the real day count/theme aren't
                    known yet. Previews that a full day-by-day structure
                    is coming, not just a flat list of stops. */}
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div
                      className="skeleton-shimmer h-4 w-16 rounded"
                      style={{ "--shimmer-delay": "0s" }}
                    />
                    <div
                      className="skeleton-shimmer mt-2 h-2.5 w-32 rounded"
                      style={{ "--shimmer-delay": "0.1s" }}
                    />
                  </div>
                  <div
                    className="skeleton-shimmer h-6 w-14 rounded"
                    style={{ "--shimmer-delay": "0.2s" }}
                  />
                </div>

                {/* Shape-matched to the FULL real StopCard — icon, name,
                    a metadata badge row, the dashed tear line, and a
                    button-placeholder row — not just the top two lines.
                    A skeleton that only sketches part of the final shape
                    reads as empty; mirroring the whole card fills the
                    space convincingly. Slight per-card delay via
                    --shimmer-delay so all three don't pulse in lockstep. */}
                {[1, 2, 3].map((item) => {
                  const delay = `${(item - 1) * 0.15}s`;
                  return (
                    <div
                      key={item}
                      className="flex overflow-hidden rounded-lg border border-[#262b31] bg-[#1c2126]"
                    >
                      <div
                        className="skeleton-shimmer w-1.5 shrink-0"
                        style={{ "--shimmer-delay": delay }}
                      />
                      <div className="flex-1 p-3.5">
                        <div className="flex items-start gap-3">
                          <div
                            className="skeleton-shimmer mt-0.5 h-4 w-4 shrink-0 rounded-full"
                            style={{ "--shimmer-delay": delay }}
                          />
                          <div className="flex-1">
                            <div
                              className="skeleton-shimmer h-3 w-2/5 rounded"
                              style={{ "--shimmer-delay": delay }}
                            />
                            <div className="mt-2 flex items-center gap-2">
                              <div
                                className="skeleton-shimmer h-2.5 w-12 rounded"
                                style={{ "--shimmer-delay": delay }}
                              />
                              <div
                                className="skeleton-shimmer h-2.5 w-10 rounded"
                                style={{ "--shimmer-delay": delay }}
                              />
                              <div
                                className="skeleton-shimmer h-4 w-14 rounded"
                                style={{ "--shimmer-delay": delay }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 border-t border-dashed border-[#262b31] pt-3">
                          <div
                            className="skeleton-shimmer h-6 w-6 rounded"
                            style={{ "--shimmer-delay": delay }}
                          />
                          <div
                            className="skeleton-shimmer h-6 w-6 rounded"
                            style={{ "--shimmer-delay": delay }}
                          />
                          <div
                            className="skeleton-shimmer h-6 w-16 rounded"
                            style={{ "--shimmer-delay": delay }}
                          />
                          <div
                            className="skeleton-shimmer ml-auto h-6 w-6 rounded"
                            style={{ "--shimmer-delay": delay }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-1 text-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingText}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-[#e8e3d8]/50"
                    >
                      {loadingText}
                    </motion.p>
                  </AnimatePresence>
                  <p className="mt-1 text-xs text-[#e8e3d8]/30">
                    This can take up to 30 seconds. You can cancel below anytime.
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <ErrorCard title={error?.title} message={error?.message} onRetry={onRetry} />
            )}
          </div>

          {/* Perforated tear line — the boarding-pass motif */}
          <div className="border-t border-dashed border-[#262b31]" />

          <div className="flex gap-3 p-4">
            <button
              type="submit"
              disabled={status === "loading" || !prompt.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded bg-[#d4a253] py-3 text-sm font-semibold text-[#12161a] transition hover:bg-[#e0b366] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {status === "loading" ? "Generating..." : "Generate Trip"}
              {status !== "loading" && <ArrowRight className="h-4 w-4" />}
            </button>

            {status === "loading" && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded border border-[#262b31] px-5 text-sm text-[#e8e3d8]/70 transition hover:bg-[#242a30]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#e8e3d8]/30">
          <span>Structured JSON</span>
          <span>Live itinerary editing</span>
          <span>Server-side validation</span>
          <span>AI refinements</span>
        </div>
      </main>
    </div>
  );
}