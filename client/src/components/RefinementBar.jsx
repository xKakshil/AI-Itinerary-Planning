import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";

const SUGGESTIONS = ["More relaxed", "More food stops", "Fewer stops", "Hidden gems"];

export default function RefinementBar({ onSubmit, isRefining }) {
  const [instruction, setInstruction] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!instruction.trim() || isRefining) return;
    onSubmit(instruction);
    setInstruction("");
  }

  return (
    <div className="mt-5 rounded-lg border border-[#262b31] bg-[#12161a] p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Wand2 className="h-4 w-4 shrink-0 text-[#d4a253]" />
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={isRefining}
          placeholder="e.g. make this day more relaxed, add more food stops..."
          className="flex-1 bg-transparent text-sm text-[#e8e3d8] placeholder:text-[#e8e3d8]/30 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!instruction.trim() || isRefining}
          className="flex shrink-0 items-center gap-1.5 rounded bg-[#d4a253] px-4 py-2 text-sm font-medium text-[#12161a] transition hover:bg-[#e0b366] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isRefining ? "Refining..." : "Refine Day"}
        </button>
      </form>

      {!isRefining && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInstruction(s)}
              className="rounded border border-[#262b31] px-3 py-1 text-xs text-[#e8e3d8]/45 hover:border-[#d4a253]/40 hover:text-[#e8e3d8]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}