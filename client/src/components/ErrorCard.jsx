export default function ErrorCard({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}) {
  return (
    <div className="mt-4 rounded border border-[#c4574b]/25 bg-[#c4574b]/[0.08] p-4">
      <h3 className="text-sm font-semibold text-[#e8e3d8]">{title}</h3>
      <p className="mt-1.5 text-sm text-[#e8e3d8]/60">{message}</p>
      <button
        onClick={onRetry}
        className="mt-3 rounded bg-[#c4574b] px-4 py-1.5 text-sm font-medium text-[#12161a] transition hover:bg-[#d16b60]"
      >
        Retry Same Prompt
      </button>
    </div>
  );
}
