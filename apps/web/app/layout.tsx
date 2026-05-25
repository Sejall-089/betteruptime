import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Betteruptime — Simple uptime monitoring",
  description:
    "Monitor your websites and get notified when something goes down.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
