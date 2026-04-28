import type { MetricWithEntries } from "@/lib/data";

function sortedEntries(metric: MetricWithEntries) {
  return [...metric.metric_entries].sort((a, b) => {
    const dateSort = a.entry_date.localeCompare(b.entry_date);
    if (dateSort !== 0) return dateSort;
    return a.created_at.localeCompare(b.created_at);
  });
}

export function latestValue(metric: MetricWithEntries) {
  const entries = sortedEntries(metric);
  return entries.at(-1)?.value ?? 0;
}

export function trend(metric: MetricWithEntries) {
  const entries = sortedEntries(metric);
  const current = entries.at(-1)?.value ?? 0;
  const previous = entries.at(-2)?.value ?? 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function hasEntries(metrics: MetricWithEntries[]) {
  return metrics.some((metric) => metric.metric_entries.length > 0);
}

export function entryCount(metrics: MetricWithEntries[]) {
  return metrics.reduce((count, metric) => count + metric.metric_entries.length, 0);
}

export function lineData(metric?: MetricWithEntries) {
  if (!metric) return [];
  const entries = sortedEntries(metric);
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

export function latestMetricData(metrics: MetricWithEntries[]) {
  return metrics.map((metric) => {
    const entries = sortedEntries(metric);
    const value = latestValue(metric);
    const metricTrend = trend(metric);
    return {
      name: metric.name,
      value,
      date: entries.at(-1)?.entry_date,
      trend: metricTrend,
      explanation: `${metricTrend >= 0 ? "Up" : "Down"} ${Math.abs(metricTrend).toFixed(1)}% from previous entry`
    };
  });
}

export function tableRows(metrics: MetricWithEntries[]) {
  return metrics
    .flatMap((metric) =>
      sortedEntries(metric).map((entry) => ({
        ...entry,
        metric_name: metric.name,
        unit: metric.unit
      }))
    )
    .sort((a, b) => {
      const dateSort = b.entry_date.localeCompare(a.entry_date);
      if (dateSort !== 0) return dateSort;
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, 12);
}
