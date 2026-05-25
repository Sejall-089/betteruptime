type Variant = "up" | "down";

export function Badge({
  variant,
  children,
}: {
  variant: Variant;
  children: React.ReactNode;
}) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
