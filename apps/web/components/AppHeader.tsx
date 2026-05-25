"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "./Brand";

/* Shared header for the signed-in app (dashboard + detail) */
export function AppHeader() {
  const router = useRouter();

  function signOut() {
    localStorage.removeItem("token");
    router.replace("/signin");
  }

  return (
    <header className="border-b border-line">
      <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center gap-6">
        <Brand size={16} />
        <nav className="hidden sm:flex items-center gap-5 text-[14px] text-ink2">
          <Link href="/dashboard" className="text-ink">
            Monitors
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={signOut}
            className="text-[13px] text-ink2 hover:text-ink"
          >
            Sign out
          </button>
          <div
            className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-semibold text-neutral-900"
            style={{ background: "linear-gradient(135deg, #FFB020, #FF4D6D)" }}
          >
            SG
          </div>
        </div>
      </div>
    </header>
  );
}
