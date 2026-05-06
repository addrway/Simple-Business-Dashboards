"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Beaker, Bot, Clock3, FolderKanban, Home, LayoutDashboard, Library, Settings, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/workspace", label: "AI Team Workspace", icon: Bot },
  { href: "/prompt-lab", label: "Prompt Lab", icon: Beaker },
  { href: "/saved-prompts", label: "Saved Prompts", icon: Library },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/task-history", label: "Task History", icon: Clock3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950 text-white lg:block">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">AI Team Workspace</p>
          <p className="text-xs text-slate-400">ChatGPT × Claude</p>
        </div>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition",
                active && "bg-white text-slate-950 shadow-sm",
                !active && "hover:bg-slate-900 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <LayoutDashboard className="h-4 w-4 text-blue-300" /> Teamwork engine
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">ChatGPT plans and builds. Claude critiques and refines. The final synthesis ships the finished product.</p>
      </div>
    </aside>
  );
}
