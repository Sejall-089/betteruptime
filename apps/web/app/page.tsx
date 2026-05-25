import Link from "next/link";
import {
  ArrowRightIcon,
  BellSimpleIcon,
  GlobeIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Brand } from "@/components/Brand";

export default function HomePage() {
  return (
    <div>
      {/* Nav */}
      <header className="border-b border-line">
        <div className="max-w-[1080px] mx-auto px-6 h-16 flex items-center">
          <Brand />
          <div className="ml-auto flex items-center gap-2">
            <Link href="/signin" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1080px] mx-auto px-6 pt-28 pb-24 text-center">
        <h1
          className="font-display font-bold tracking-[-0.03em] leading-[1.05]"
          style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
        >
          Know the moment your
          <br />
          site goes down.
        </h1>
        <p className="mt-6 text-ink2 text-[17px] leading-relaxed max-w-[520px] mx-auto">
          Add a URL. We&apos;ll check it every 3 minutes and tell you the second
          something breaks. Nothing more.
        </p>
        <div className="mt-9 flex gap-3 items-center justify-center">
          <Link href="/signup" className="btn btn-primary btn-lg">
            Start monitoring <ArrowRightIcon size={16} weight="bold" />
          </Link>
          <Link href="/dashboard" className="btn btn-secondary btn-lg">
            See demo
          </Link>
        </div>
        <p className="mt-5 text-[13px] text-ink3">
          Free for up to 10 monitors. No credit card required.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-[1080px] mx-auto px-6 pb-28">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: <GlobeIcon size={20} />,
              title: "Simple checks",
              body: "We ping your URL every 60 seconds and record the response.",
            },
            {
              icon: <BellSimpleIcon size={20} />,
              title: "Instant alerts",
              body: "Email or Slack the moment we detect downtime — no noise.",
            },
            {
              icon: <ShieldCheckIcon size={20} />,
              title: "Uptime history",
              body: "30 days of uptime, response times, and incidents at a glance.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="w-9 h-9 rounded-md grid place-items-center text-brand bg-brand/10 mb-4">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-[18px] mb-1.5">
                {f.title}
              </h3>
              <p className="text-ink2 text-[14px] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center justify-between text-[13px] text-ink3">
          <span>© 2026 Betteruptime</span>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="#" className="hover:text-ink">
              Terms
            </Link>
            <Link href="#" className="hover:text-ink">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
