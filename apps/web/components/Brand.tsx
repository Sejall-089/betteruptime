import Link from "next/link";

export function Brand({
  href = "/",
  size = 18,
}: {
  href?: string;
  size?: number;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-display font-bold tracking-tight text-ink"
      style={{ fontSize: size }}
    >
      <svg width={size + 4} height={size + 4} viewBox="0 0 22 22" fill="none">
        <path
          d="M2 11 L7 11 L9 5 L13 17 L15 11 L20 11"
          stroke="#F5A623"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Betteruptime
    </Link>
  );
}
