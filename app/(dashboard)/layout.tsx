"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopNav } from "@/components/dashboard/TopNav";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/workspace": "AI Team Workspace",
  "/prompt-lab": "Prompt Lab",
  "/saved-prompts": "Saved Prompts",
  "/projects": "Projects",
  "/task-history": "Task History",
  "/settings": "Settings",
  "/admin": "Admin Dashboard",
  "/logistics": "Legacy Logistics Dashboard",
  "/retail": "Legacy Retail Dashboard",
  "/custom": "Legacy Custom Graph Builder",
  "/data-entry": "Legacy Data Entry"
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <TopNav title={titles[pathname] ?? "AI Team Workspace"} />
        <main>{children}</main>
      </div>
    </div>
  );
}
