import type { ElementType } from "react";
import { ArrowDownRight, ArrowUpRight, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent } from "@/lib/utils";

type KPIcardProps = {
  label: string;
  value: number;
  unit: string;
  trend: number;
  icon?: ElementType;
  accent?: "emerald" | "blue" | "amber" | "red" | "violet";
  helper?: string;
};

const accentStyles = {
  emerald: "from-emerald-50 to-white text-emerald-700 ring-emerald-100",
  blue: "from-blue-50 to-white text-blue-700 ring-blue-100",
  amber: "from-amber-50 to-white text-amber-700 ring-amber-100",
  red: "from-red-50 to-white text-red-700 ring-red-100",
  violet: "from-violet-50 to-white text-violet-700 ring-violet-100"
};

function displayValue(value: number, unit: string) {
  if (unit === "%") return `${formatNumber(value)}%`;
  if (unit === "$") return `$${formatNumber(value)}`;
  return formatNumber(value);
}

export function KPIcard({ label, value, unit, trend, icon: Icon = Activity, accent = "emerald", helper }: KPIcardProps) {
  const positive = trend >= 0;

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
      <CardContent className={cn("bg-gradient-to-br p-5", accentStyles[accent])}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">{displayValue(value, unit)}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/90 shadow-sm ring-1 ring-current/10">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className={positive ? "inline-flex items-center gap-1 text-sm font-medium text-emerald-700" : "inline-flex items-center gap-1 text-sm font-medium text-red-600"}>
            {positive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            <span>{formatPercent(trend)}</span>
          </p>
          <p className="truncate text-sm text-slate-500">{helper ?? "vs previous entry"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
