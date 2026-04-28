"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DataEntryForm } from "@/components/dashboard/DataEntryForm";
import { KPIcard } from "@/components/dashboard/KPIcard";
import { MetricTable } from "@/components/dashboard/MetricTable";
import { Card, CardContent } from "@/components/ui/card";
import { getBusiness, getMetrics, getSessionUser, type MetricWithEntries } from "@/lib/data";
import { latestMetricData, latestValue, lineData, tableRows, trend } from "@/lib/dashboard";
import type { Business, DashboardType } from "@/types/database";

export function DashboardPage({ type, title }: { type?: DashboardType; title: string }) {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [metrics, setMetrics] = useState<MetricWithEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const user = await getSessionUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const businessData = await getBusiness(user.id);
      if (!businessData) {
        router.push("/settings");
        return;
      }
      setBusiness(businessData);
      setMetrics(await getMetrics(businessData.id, type));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

  const primaryMetric = metrics[0];
  const rows = tableRows(metrics);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm text-muted-foreground">{business?.name ?? "Your business"}</p>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.length === 0 ? (
          <Card className="md:col-span-3">
            <CardContent className="p-5 text-sm text-muted-foreground">
              No metrics yet. Choose a dashboard type in Settings to create starter metrics.
            </CardContent>
          </Card>
        ) : (
          metrics.slice(0, 3).map((metric) => (
            <KPIcard key={metric.id} label={metric.name} value={latestValue(metric)} unit={metric.unit} trend={trend(metric)} />
          ))
        )}
      </div>
      <DataEntryForm metrics={metrics} onSaved={load} />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title={primaryMetric ? `${primaryMetric.name} trend` : "Trend"} type="line" data={lineData(primaryMetric)} />
        </div>
        <ChartCard title="Metric mix" type="pie" data={latestMetricData(metrics)} />
      </div>
      <ChartCard title="Latest values" type="bar" data={latestMetricData(metrics)} />
      <MetricTable rows={rows} />
    </div>
  );
}
