"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartDatum = {
  name: string;
  value: number;
  date?: string;
  trend?: number;
  explanation?: string;
};

type TooltipPayload = {
  payload?: ChartDatum;
  value?: number | string;
};

const palette = ["#047857", "#2563eb", "#f59e0b", "#dc2626", "#7c3aed"];

function DashboardTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: ReactNode }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  if (!item) return null;
  const rawValue = payload[0].value ?? item.value;
  const value = typeof rawValue === "number" ? rawValue.toLocaleString() : rawValue;

  return (
    <div className="rounded-lg border bg-white p-3 text-sm shadow-lg">
      <p className="font-medium text-slate-950">{label ?? item.name}</p>
      <p className="text-slate-500">Value: {value}</p>
      <p className="text-slate-500">Date: {item.date ?? "Latest"}</p>
      <p className={item.trend && item.trend < 0 ? "font-medium text-red-600" : "font-medium text-emerald-700"}>
        {item.explanation ?? "No previous entry yet"}
      </p>
    </div>
  );
}

export function ChartCard({
  title,
  type,
  data,
  description,
  className,
  height = "h-72"
}: {
  title: string;
  type: "line" | "bar" | "pie";
  data: ChartDatum[];
  description?: string;
  className?: string;
  height?: string;
}) {
  const empty = data.length === 0;

  return (
    <Card className={cn("overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className={height}>
          {empty ? (
            <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm text-muted-foreground">
              Add data to generate this chart.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {type === "line" ? (
                <LineChart data={data} margin={{ top: 10, right: 18, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip content={<DashboardTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#047857" strokeWidth={3} dot={{ r: 4, fill: "#047857" }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : type === "bar" ? (
                <BarChart data={data} margin={{ top: 10, right: 18, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip content={<DashboardTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {data.map((_, index) => (
                      <Cell key={index} fill={palette[index % palette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Tooltip content={<DashboardTooltip />} />
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98} paddingAngle={3}>
                    {data.map((_, index) => (
                      <Cell key={index} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
