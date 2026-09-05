export default function UndoToast({ visible, onUndo }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[#262b31] bg-[#1c2126] px-5 py-3.5 shadow-2xl">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-[#e8e3d8]/70">Stop removed</span>
        <button onClick={onUndo} className="font-semibold text-[#d4a253] hover:text-[#e0b366]">
          Undo
        </button>
      </div>
    </div>
  );
}
