"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopNav } from "@/components/dashboard/TopNav";

const titles: Record<string, string> = {
  "/dashboard": "Command Center",
  "/logistics": "Logistics Dashboard",
  "/retail": "Retail Dashboard",
  "/custom": "Custom Graph Builder",
  "/data-entry": "Data Entry",
  "/settings": "Settings",
  "/admin": "Admin Dashboard"
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <TopNav title={titles[pathname] ?? "Dashboard"} />
        <main>{children}</main>
      </div>
    </div>
  );
}
