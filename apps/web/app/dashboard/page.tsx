"use client";

import {
  CaretRightIcon,
  CheckIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/Badge";
import { StatusDot } from "@/components/StatusDot";
import { BACKEND_URL } from "@/config";

type Website = {
  id: number;
  name: string;
  url: string;
  status: "up" | "down" | "pending";
  responseTime: number;
  checkedAt: Date;
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

function normalizeUrl(url: string) {
  const trimmedUrl = url.trim();
  if (/^https?:\/\//i.test(trimmedUrl)) return trimmedUrl;

  return `https://${trimmedUrl}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWebsiteName, setNewWebsiteName] = useState("");
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [addErrorMessage, setAddErrorMessage] = useState<string | null>(null);
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);

  async function fetchWebsites() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/signin");
        return;
      }

      setErrorMessage(null);
      const response = await axios.get<WebsiteResponse[]>(
        `${BACKEND_URL}/websites`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      setWebsites(
        response.data.map((website) => {
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
            checkedAt: latestTick?.checkedAt
              ? new Date(latestTick.checkedAt)
              : new Date(),
          };
        }),
      );
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/signin");
        return;
      }

      setErrorMessage(
        "Unable to load websites. Check that the backend is running.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchWebsites();
    const interval = setInterval(fetchWebsites, 30 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  function closeAddModal() {
    setIsAddModalOpen(false);
    setNewWebsiteName("");
    setNewWebsiteUrl("");
    setAddErrorMessage(null);
  }

  async function addWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    const trimmedName = newWebsiteName.trim();
    const trimmedUrl = newWebsiteUrl.trim();

    if (!trimmedName || !trimmedUrl) {
      setAddErrorMessage("Name and URL are required.");
      return;
    }

    try {
      setIsAddingWebsite(true);
      setAddErrorMessage(null);

      await axios.post(
        `${BACKEND_URL}/create-website`,
        {
          name: trimmedName,
          url: normalizeUrl(trimmedUrl),
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      closeAddModal();
      await fetchWebsites();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/signin");
        return;
      }

      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setAddErrorMessage(
          error.response.data?.message ?? "Unable to add website.",
        );
        return;
      }

      setAddErrorMessage(
        "Unable to add website. Check that the backend is running.",
      );
    } finally {
      setIsAddingWebsite(false);
    }
  }

  const up = websites.filter((website) => website.status === "up").length;
  const down = websites.filter((website) => website.status === "down").length;

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-[28px] tracking-tight">
            Monitors
          </h1>
          <p className="text-ink2 text-[14px] mt-1">
            {up} up - {down > 0 ? `${down} down` : "all systems normal"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
        >
          <PlusIcon size={14} weight="bold" /> Add website
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="px-5 py-8 text-center text-[14px] text-ink2">
            Loading monitors...
          </div>
        ) : errorMessage ? (
          <div className="px-5 py-8 text-center text-[14px] text-red-400">
            {errorMessage}
          </div>
        ) : websites.length === 0 ? (
          <div className="px-5 py-8 text-center text-[14px] text-ink2">
            No monitors found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[8px_minmax(0,1fr)_88px_88px_14px] items-center gap-4 px-5 py-3 border-b border-line bg-white/[0.02] text-[11px] font-medium uppercase text-ink3 max-md:grid-cols-[8px_minmax(0,1fr)_88px_14px]">
              <div />
              <div>Website</div>
              <div className="hidden text-right md:block">
                Response
              </div>
              <div className="text-center">Status</div>
              <div />
            </div>

            {websites.map((website) => (
              <Link
                key={website.id}
                href={`/dashboard/${website.id}`}
                className="grid grid-cols-[8px_minmax(0,1fr)_88px_88px_14px] items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors max-md:grid-cols-[8px_minmax(0,1fr)_88px_14px]"
              >
                <StatusDot
                  status={
                    website.status === "pending" ? "down" : website.status
                  }
                />

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[15px] truncate">
                    {website.name}
                  </div>
                  <div className="text-[13px] text-ink3 font-mono truncate">
                    {website.url}
                  </div>
                </div>

                <div className="hidden flex-col items-end md:flex">
                  <div className="text-[13px] font-mono text-ink">
                    {website.status === "down"
                      ? "-"
                      : website.status === "pending"
                        ? "-"
                        : `${website.responseTime}ms`}
                  </div>
                  <div className="text-[12px] text-ink3">response</div>
                </div>

                {website.status === "pending" ? (
                  <span className="badge justify-self-center text-ink2 bg-white/[0.06]">
                    Checking
                  </span>
                ) : (
                  <span className="justify-self-center">
                    <Badge variant={website.status}>
                      {website.status === "up" ? "Up" : "Down"}
                    </Badge>
                  </span>
                )}

                <CaretRightIcon size={14} className="text-ink3" />
              </Link>
            ))}
          </>
        )}
      </div>

      <p className="text-center text-[13px] text-ink3 mt-6">
        Auto-refreshing every 30 seconds.
      </p>

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <div className="card w-full max-w-[460px] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display font-semibold text-[20px]">
                  Add website
                </h2>
                <p className="text-[13px] text-ink2 mt-1">
                  Create a monitor for a website endpoint.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                className="btn btn-ghost btn-sm !h-8 !w-8 !px-0"
                aria-label="Close"
              >
                <XIcon size={16} />
              </button>
            </div>

            <form onSubmit={addWebsite} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="website-name" className="field-label">
                  Name
                </label>
                <input
                  id="website-name"
                  value={newWebsiteName}
                  onChange={(event) => setNewWebsiteName(event.target.value)}
                  placeholder="Main website"
                  className="input"
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="website-url" className="field-label">
                  URL
                </label>
                <input
                  id="website-url"
                  value={newWebsiteUrl}
                  onChange={(event) => setNewWebsiteUrl(event.target.value)}
                  placeholder="https://example.com"
                  className="input font-mono text-[13px]"
                  autoComplete="url"
                />
              </div>

              {addErrorMessage ? (
                <div className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-[13px] text-red-300">
                  {addErrorMessage}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingWebsite}
                  className="btn btn-primary"
                >
                  {isAddingWebsite ? (
                    <>
                      <PlusIcon size={14} weight="bold" /> Adding...
                    </>
                  ) : (
                    <>
                      <CheckIcon size={14} weight="bold" /> Add website
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
