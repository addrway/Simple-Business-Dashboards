import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Team Workspace | ChatGPT and Claude Teamwork Engine",
  description: "A multi-AI SaaS workspace where ChatGPT and Claude collaborate to complete tasks."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
