import { latestValue, lineData, trend } from "@/lib/dashboard";
import type { MetricWithEntries } from "@/lib/data";

type ChartDatum = {
  name: string;
  value: number;
  date?: string;
  trend?: number;
  explanation?: string;
};

export function findRetailMetric(metrics: MetricWithEntries[], name: string) {
  return metrics.find((metric) => metric.name.toLowerCase() === name.toLowerCase());
}

export function retailLatest(metrics: MetricWithEntries[], name: string) {
  const metric = findRetailMetric(metrics, name);
  return metric ? latestValue(metric) : 0;
}

export function retailTrend(metrics: MetricWithEntries[], name: string) {
  const metric = findRetailMetric(metrics, name);
  return metric ? trend(metric) : 0;
}

export function profitEstimate(metrics: MetricWithEntries[]) {
  const explicitProfit = retailLatest(metrics, "Profit Estimate");
  if (explicitProfit) return explicitProfit;
  return retailLatest(metrics, "Sales") - retailLatest(metrics, "Expenses");
}

export function averageOrderValue(metrics: MetricWithEntries[]) {
  const explicitAverage = retailLatest(metrics, "Average Order Value") || retailLatest(metrics, "Average Ticket");
  if (explicitAverage) return explicitAverage;
  const orders = retailLatest(metrics, "Orders");
  if (!orders) return 0;
  return retailLatest(metrics, "Sales") / orders;
}

export function salesTrendData(metrics: MetricWithEntries[]) {
  return lineData(findRetailMetric(metrics, "Sales"));
}

export function categorySalesData(metrics: MetricWithEntries[]): ChartDatum[] {
  const categoryMetric = findRetailMetric(metrics, "Category Sales");
  if (!categoryMetric) return [];

  const totals = new Map<string, number>();
  for (const entry of categoryMetric.metric_entries) {
    const category = entry.note?.trim() || "Unassigned";
    totals.set(category, (totals.get(category) ?? 0) + entry.value);
  }

  return [...totals.entries()]
    .map(([name, value]) => ({
      name,
      value,
      explanation: `$${value.toLocaleString()} recorded for ${name}`
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export function retailMixData(metrics: MetricWithEntries[]): ChartDatum[] {
  return [
    { name: "Sales", value: retailLatest(metrics, "Sales"), explanation: "Latest sales entered" },
    { name: "Expenses", value: retailLatest(metrics, "Expenses"), explanation: "Latest expenses entered" },
    { name: "Returns", value: retailLatest(metrics, "Returns"), explanation: "Latest returns entered" },
    { name: "Inventory sold", value: retailLatest(metrics, "Inventory Sold"), explanation: "Latest inventory sold" }
  ].filter((item) => item.value > 0);
}
