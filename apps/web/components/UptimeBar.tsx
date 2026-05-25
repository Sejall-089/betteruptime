export function UptimeBar({ cells }: { cells: boolean[] }) {
  return (
    <div className="flex gap-[2px] items-stretch h-6">
      {cells.map((up, i) => (
        <div
          key={i}
          className="flex-1 min-w-[3px] rounded-[2px] transition-[filter]"
          style={{ background: up ? "#4ADE80" : "#FF4D6D" }}
          title={`day -${cells.length - i}: ${up ? "up" : "down"}`}
        />
      ))}
    </div>
  );
}
