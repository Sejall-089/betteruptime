export function StatusDot({ status }: { status: "up" | "down" }) {
  return <span className={`dot dot-${status}`} aria-label={status} />;
}
