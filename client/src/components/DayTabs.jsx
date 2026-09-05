export default function DayTabs({ dayOrder, daysById, activeDayId, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[#262b31]">
      {dayOrder.map((dayId) => {
        const day = daysById[dayId];
        const isActive = activeDayId === dayId;

        return (
          <button
            key={dayId}
            onClick={() => onChange(dayId)}
            className={`whitespace-nowrap rounded-t-lg border border-b-0 px-5 py-2.5 text-sm font-medium transition ${
              isActive
                ? "-mb-px border-[#262b31] bg-[#1c2126] text-[#e8e3d8]"
                : "translate-y-[3px] border-transparent bg-transparent text-[#e8e3d8]/35 hover:text-[#e8e3d8]/60"
            }`}
          >
            Day {day.day_number}
          </button>
        );
      })}
    </div>
  );
}