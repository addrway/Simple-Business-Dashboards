import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "JARVIS Core",
  description: "Living AI interface for JARVIS"
};
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
