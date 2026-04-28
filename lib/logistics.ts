import { latestValue, trend } from "@/lib/dashboard";
import type { MetricWithEntries } from "@/lib/data";

type ChartDatum = {
  name: string;
  value: number;
  date?: string;
  trend?: number;
  explanation?: string;
};

export function findMetric(metrics: MetricWithEntries[], name: string) {
  return metrics.find((metric) => metric.name.toLowerCase() === name.toLowerCase());
}

export function metricLatest(metrics: MetricWithEntries[], name: string) {
  const metric = findMetric(metrics, name);
  return metric ? latestValue(metric) : 0;
}

export function metricTrend(metrics: MetricWithEntries[], name: string) {
  const metric = findMetric(metrics, name);
  return metric ? trend(metric) : 0;
}

export function onTimeDeliveryRate(metrics: MetricWithEntries[]) {
  const deliveries = metricLatest(metrics, "Deliveries");
  const onTime = metricLatest(metrics, "On-Time Deliveries");
  if (!deliveries) return 0;
  return (onTime / deliveries) * 100;
}

export function costPerDelivery(metrics: MetricWithEntries[]) {
  const explicitCost = metricLatest(metrics, "Cost Per Delivery");
  if (explicitCost) return explicitCost;
  const deliveries = metricLatest(metrics, "Deliveries");
  const totalCost = metricLatest(metrics, "Total Cost");
  if (!deliveries) return 0;
  return totalCost / deliveries;
}

export function metricLineData(metric?: MetricWithEntries): ChartDatum[] {
  if (!metric) return [];
  const entries = [...metric.metric_entries].sort((a, b) => {
    const dateSort = a.entry_date.localeCompare(b.entry_date);
    if (dateSort !== 0) return dateSort;
    return a.created_at.localeCompare(b.created_at);
  });

  return entries.map((entry, index) => {
    const previous = entries[index - 1]?.value;
    const delta = previous ? ((entry.value - previous) / previous) * 100 : 0;
    return {
      name: entry.entry_date.slice(5),
      value: entry.value,
      date: entry.entry_date,
      trend: delta,
      explanation: previous ? `${delta >= 0 ? "Up" : "Down"} ${Math.abs(delta).toFixed(1)}% from previous entry` : "First saved entry"
    };
  });
}

export function deliveryStatusData(metrics: MetricWithEntries[]): ChartDatum[] {
  const onTime = metricLatest(metrics, "On-Time Deliveries");
  const late = metricLatest(metrics, "Late Deliveries");
  const deliveries = metricLatest(metrics, "Deliveries");
  const unknown = Math.max(deliveries - onTime - late, 0);

  return [
    { name: "On time", value: onTime, explanation: "Completed within the expected delivery window" },
    { name: "Late", value: late, explanation: "Deliveries that missed the expected window" },
    { name: "Unclassified", value: unknown, explanation: "Deliveries without a status yet" }
  ].filter((item) => item.value > 0);
}

export function regionBreakdownData(metrics: MetricWithEntries[]): ChartDatum[] {
  const regionMetric = findMetric(metrics, "Region Volume");
  if (!regionMetric) return [];

  const totals = new Map<string, number>();
  for (const entry of regionMetric.metric_entries) {
    const region = entry.note?.trim() || "Unassigned";
    totals.set(region, (totals.get(region) ?? 0) + entry.value);
  }

  return [...totals.entries()]
    .map(([name, value]) => ({
      name,
      value,
      explanation: `${value.toLocaleString()} deliveries recorded for ${name}`
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export function topProblemAreas(metrics: MetricWithEntries[]) {
  const deliveries = metricLatest(metrics, "Deliveries");
  const late = metricLatest(metrics, "Late Deliveries");
  const fuelCost = metricLatest(metrics, "Fuel Cost");
  const laborHours = metricLatest(metrics, "Labor Hours");
  const totalCost = metricLatest(metrics, "Total Cost");
  const problems = [
    {
      label: "Late deliveries",
      value: late,
      detail: deliveries ? `${((late / deliveries) * 100).toFixed(1)}% of latest deliveries` : "Add delivery volume to calculate rate"
    },
    {
      label: "Fuel spend",
      value: fuelCost,
      detail: totalCost ? `${((fuelCost / totalCost) * 100).toFixed(1)}% of latest total cost` : "Track total cost to compare spend"
    },
    {
      label: "Labor load",
      value: laborHours,
      detail: deliveries ? `${(laborHours / deliveries).toFixed(2)} hours per delivery` : "Add deliveries to calculate workload"
    }
  ];

  return problems.sort((a, b) => b.value - a.value);
}
