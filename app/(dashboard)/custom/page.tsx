"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { CustomGraphForm } from "@/components/dashboard/CustomGraphForm";
import { getBusiness, getCustomCharts, getMetrics, getSessionUser, type MetricWithEntries } from "@/lib/data";
import { latestMetricData, lineData } from "@/lib/dashboard";
import type { Business, CustomChart } from "@/types/database";

export default function CustomPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [business, setBusiness] = useState<Business | null>(null);
  const [metrics, setMetrics] = useState<MetricWithEntries[]>([]);
  const [charts, setCharts] = useState<CustomChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const user = await getSessionUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
      const businessData = await getBusiness(user.id);
      if (!businessData) {
        router.push("/settings");
        return;
      }
      setBusiness(businessData);
      const metricData = await getMetrics(businessData.id);
      setMetrics(metricData);
      setCharts(await getCustomCharts(user.id, businessData.id));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load custom charts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;
  if (loading || !business) return <div className="p-8 text-sm text-muted-foreground">Loading custom builder...</div>;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm text-muted-foreground">{business.name}</p>
        <h2 className="text-2xl font-semibold">Custom Graph Builder</h2>
      </div>
      <CustomGraphForm userId={userId} businessId={business.id} metrics={metrics} onCreated={load} />
      <div className="grid gap-4 xl:grid-cols-2">
        {charts.length === 0 ? (
          <ChartCard title="Preview" type="line" data={lineData(metrics[0])} />
        ) : (
          charts.map((chart) => {
            const metric = metrics.find((item) => item.id === chart.metric_id) ?? metrics[0];
            const data = chart.chart_type === "pie" ? latestMetricData(metrics) : lineData(metric);
            return <ChartCard key={chart.id} title={chart.title} type={chart.chart_type as "line" | "bar" | "pie"} data={data} />;
          })
        )}
      </div>
    </div>
  );
}
