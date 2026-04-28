import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SBD | Simple Business Dashboard",
  description: "Beautiful business dashboards without technical complexity."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
