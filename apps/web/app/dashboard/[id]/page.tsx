"use client";

import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  PauseIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react/dist/ssr";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/Badge";
import { StatusDot } from "@/components/StatusDot";
import { UptimeBar } from "@/components/UptimeBar";
import { BACKEND_URL } from "@/config";
import { recentChecks, uptimeCells } from "@/lib/data";

type WebsiteStatus = "up" | "down" | "pending";

type Website = {
  id: number;
  name: string;
  url: string;
  status: WebsiteStatus;
  responseTime: number;
  checkedAt: Date | null;
};

type WebsiteResponse = {
  id: number;
  name: string;
  url: string;
  ticks: {
    status: "UP" | "DOWN";
    latency: number | null;
    checkedAt: string;
  }[];
};

function toWebsite(website: WebsiteResponse): Website {
  const latestTick = website.ticks[0];

  return {
    id: website.id,
    name: website.name,
    url: website.url,
    status: latestTick
      ? latestTick.status === "UP"
        ? "up"
        : "down"
      : "pending",
    responseTime: latestTick?.latency ?? 0,
    checkedAt: latestTick?.checkedAt ? new Date(latestTick.checkedAt) : null,
  };
}

function formatLastCheck(date: Date | null) {
  if (!date) return "not checked";

  const secondsAgo = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / 1000),
  );
  if (secondsAgo < 60) return `${secondsAgo}s ago`;

  const minutesAgo = Math.round(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo}m ago`;

  const hoursAgo = Math.round(minutesAgo / 60);
  return `${hoursAgo}h ago`;
}

export default function WebsiteDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [website, setWebsite] = useState<Website | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWebsite() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/signin");
          return;
        }

        setErrorMessage(null);
        const response = await axios.get<WebsiteResponse>(
          `${BACKEND_URL}/websites/${params.id}`,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        setWebsite(toWebsite(response.data));
      } catch (error) {
        console.error(error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/signin");
          return;
        }

        if (axios.isAxiosError(error) && error.response?.status === 404) {
          router.push("/dashboard");
          return;
        }

        setErrorMessage(
          "Unable to load website. Check that the backend is running.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchWebsite();
  }, [params.id, router]);

  const statusForHistory = website?.status === "down" ? "down" : "up";
  const cells = uptimeCells((website?.id ?? 1) * 13 + 7, statusForHistory);
  const checks = recentChecks((website?.id ?? 1) * 7 + 3, statusForHistory);

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink2 hover:text-ink mb-6"
      >
        <ArrowLeftIcon size={14} /> All monitors
      </Link>

      {isLoading ? (
        <div className="card px-6 py-8 text-center text-[14px] text-ink2">
          Loading monitor...
        </div>
      ) : errorMessage ? (
        <div className="card px-6 py-8 text-center text-[14px] text-red-400">
          {errorMessage}
        </div>
      ) : website ? (
        <>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <StatusDot
                  status={
                    website.status === "pending" ? "down" : website.status
                  }
                />
                <h1 className="font-display font-bold text-[28px] tracking-tight">
                  {website.name}
                </h1>
                {website.status === "pending" ? (
                  <span className="badge text-ink2 bg-white/[0.06]">
                    Checking
                  </span>
                ) : (
                  <Badge variant={website.status}>
                    {website.status === "up" ? "Up" : "Down"}
                  </Badge>
                )}
              </div>
              <a
                href={website.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[14px] text-ink2 font-mono hover:text-ink break-all"
              >
                {website.url} <ArrowSquareOutIcon size={13} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Stat label="Uptime · 30d" value="-" />
            <Stat
              label="Response time"
              value={
                website.status === "up" ? `${website.responseTime}ms` : "-"
              }
            />
            <Stat
              label="Last check"
              value={formatLastCheck(website.checkedAt)}
            />
            <Stat label="Check interval" value="180s" />
          </div>

          <div className="card p-6 mb-6">
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="font-display font-semibold text-[16px]">
                Last 30 days
              </h2>
              <span className="text-[13px] text-ink3 font-mono">
                {cells.filter((cell) => !cell).length === 0
                  ? "no incidents"
                  : `${cells.filter((cell) => !cell).length} day${
                      cells.filter((cell) => !cell).length === 1 ? "" : "s"
                    } with incidents`}
              </span>
            </div>
            <UptimeBar cells={cells} />
            <div className="flex justify-between mt-2 text-[12px] text-ink3 font-mono">
              <span>30 days ago</span>
              <span>today</span>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-line">
              <h2 className="font-display font-semibold text-[16px]">
                Recent checks
              </h2>
            </div>
            <div>
              {checks.map((check, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 px-6 py-3 text-[13px] ${
                    index > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <StatusDot status={check.ok ? "up" : "down"} />
                  <span
                    className={`flex-1 ${
                      check.ok ? "text-ink" : "text-coral-300"
                    } font-mono`}
                    style={{ color: check.ok ? "var(--ink)" : "#FF8FA3" }}
                  >
                    {check.ok ? "200 OK" : "Request failed"}
                  </span>
                  <span className="font-mono text-ink2 text-right min-w-[70px]">
                    {check.ok ? `${check.ms}ms` : "-"}
                  </span>
                  <span className="text-ink3 text-right min-w-[80px]">
                    {check.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-4 py-4">
      <div className="text-[12px] text-ink3 mb-1.5">{label}</div>
      <div className="font-display font-semibold text-[20px] tracking-tight">
        {value}
      </div>
    </div>
  );
}
