export type Status = "up" | "down";

export type Website = {
  id: string;
  name: string;
  url: string;
  status: Status;
  uptime: number; // % over last 30 days
  responseTime: number; // ms, last check
  lastCheckedAgo: string;
};

export const websites: Website[] = [
  {
    id: "marketing",
    name: "Marketing site",
    url: "https://acme.com",
    status: "up",
    uptime: 99.98,
    responseTime: 142,
    lastCheckedAgo: "10s ago",
  },
  {
    id: "app",
    name: "App",
    url: "https://app.acme.com",
    status: "up",
    uptime: 99.94,
    responseTime: 218,
    lastCheckedAgo: "12s ago",
  },
  {
    id: "api",
    name: "API",
    url: "https://api.acme.com/health",
    status: "down",
    uptime: 97.21,
    responseTime: 0,
    lastCheckedAgo: "8s ago",
  },
  {
    id: "docs",
    name: "Docs",
    url: "https://docs.acme.com",
    status: "up",
    uptime: 100.0,
    responseTime: 89,
    lastCheckedAgo: "15s ago",
  },
  {
    id: "checkout",
    name: "Checkout",
    url: "https://checkout.acme.com",
    status: "up",
    uptime: 99.81,
    responseTime: 311,
    lastCheckedAgo: "11s ago",
  },
  {
    id: "status",
    name: "Status page",
    url: "https://status.acme.com",
    status: "up",
    uptime: 100.0,
    responseTime: 47,
    lastCheckedAgo: "13s ago",
  },
];

export function getWebsite(id: string) {
  return websites.find((w) => w.id === id);
}

/* Deterministic 30-day uptime cells per website (true = up) */
export function uptimeCells(seed: number, status: Status): boolean[] {
  const out: boolean[] = [];
  let s = seed;
  const rng = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const downDays = new Set<number>();
  if (status === "down") downDays.add(29);
  // sprinkle 0-2 historical blips
  for (let k = 0; k < 2; k++) {
    if (rng() > 0.4) downDays.add(Math.floor(rng() * 28));
  }
  for (let i = 0; i < 30; i++) out.push(!downDays.has(i));
  return out;
}

/* Deterministic recent checks for the detail page */
export function recentChecks(seed: number, status: Status) {
  let s = seed;
  const rng = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const out: { time: string; ok: boolean; ms: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const minutesAgo = i;
    const time = `${minutesAgo === 0 ? "just now" : `${minutesAgo}m ago`}`;
    const ok = !(status === "down" && i < 3);
    const ms = ok ? Math.round(80 + rng() * 240) : 0;
    out.push({ time, ok, ms });
  }
  return out;
}
