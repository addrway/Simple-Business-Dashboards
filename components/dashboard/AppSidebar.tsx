"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, PackageCheck, Settings, Shield, ShoppingBag, SlidersHorizontal, TableProperties } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Command Center", icon: Home },
  { href: "/logistics", label: "Logistics", icon: PackageCheck },
  { href: "/retail", label: "Retail", icon: ShoppingBag },
  { href: "/custom", label: "Custom Builder", icon: SlidersHorizontal },
  { href: "/data-entry", label: "Data Entry", icon: TableProperties },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r bg-white lg:block">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-700 text-white">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">SBD</p>
          <p className="text-xs text-muted-foreground">Simple dashboards</p>
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
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition",
                active && "bg-emerald-50 text-emerald-800",
                !active && "hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
