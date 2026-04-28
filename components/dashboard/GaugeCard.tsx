"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

function GaugeTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; date?: string; explanation?: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border bg-white p-3 text-sm shadow-lg">
      <p className="font-medium text-slate-950">{item.name}</p>
      <p className="text-slate-500">Value: {formatNumber(item.value)}%</p>
      <p className="text-slate-500">Date: {item.date ?? "Latest"}</p>
      <p className="font-medium text-emerald-700">{item.explanation ?? "Current progress"}</p>
    </div>
  );
}

export function GaugeCard({
  title,
  value,
  description,
  explanation
}: {
  title: string;
  value: number;
  description: string;
  explanation: string;
}) {
  const safeValue = Math.max(0, Math.min(value, 100));
  const data = [
    { name: title, value: safeValue, explanation },
    { name: "Remaining", value: 100 - safeValue, explanation: "Room to improve" }
  ];

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<GaugeTooltip />} />
              <Pie data={data} dataKey="value" startAngle={180} endAngle={0} innerRadius={72} outerRadius={104} paddingAngle={2}>
                <Cell fill="#047857" />
                <Cell fill="#e2e8f0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 bottom-9 text-center">
            <p className="text-4xl font-semibold tracking-normal text-slate-950">{formatNumber(safeValue)}%</p>
            <p className="mt-1 text-sm text-slate-500">{explanation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
