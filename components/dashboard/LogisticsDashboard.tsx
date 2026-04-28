"use client";

import { useEffect, useState } from "react";
import type { ElementType } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, Fuel, MapPinned, PackageCheck, Timer, Truck } from "lucide-react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DataEntryForm } from "@/components/dashboard/DataEntryForm";
import { KPIcard } from "@/components/dashboard/KPIcard";
import { MetricTable } from "@/components/dashboard/MetricTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureDefaultMetrics, getBusiness, getMetrics, getSessionUser, type MetricWithEntries } from "@/lib/data";
import { tableRows } from "@/lib/dashboard";
import {
  costPerDelivery,
  deliveryStatusData,
  findMetric,
  metricLatest,
  metricLineData,
  metricTrend,
  onTimeDeliveryRate,
  regionBreakdownData,
  topProblemAreas
} from "@/lib/logistics";
import { formatNumber } from "@/lib/utils";
import type { Business } from "@/types/database";

function MiniStat({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function LogisticsDashboard() {
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

      await ensureDefaultMetrics(businessData.id, "logistics");
      setBusiness(businessData);
      setMetrics(await getMetrics(businessData.id, "logistics"));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load logistics dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading logistics dashboard...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

  const deliveries = metricLatest(metrics, "Deliveries");
  const lateDeliveries = metricLatest(metrics, "Late Deliveries");
  const fuelCost = metricLatest(metrics, "Fuel Cost");
  const laborHours = metricLatest(metrics, "Labor Hours");
  const totalCost = metricLatest(metrics, "Total Cost");
  const onTimeRate = onTimeDeliveryRate(metrics);
  const costPerStop = costPerDelivery(metrics);
  const deliveryMetric = findMetric(metrics, "Deliveries");
  const statusData = deliveryStatusData(metrics);
  const regionData = regionBreakdownData(metrics);
  const problemAreas = topProblemAreas(metrics);
  const rows = tableRows(metrics);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm text-muted-foreground">{business?.name ?? "Your business"}</p>
        <h2 className="text-2xl font-semibold">Logistics Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIcard label="Total Deliveries" value={deliveries} unit="orders" trend={metricTrend(metrics, "Deliveries")} />
        <KPIcard label="On-Time Delivery %" value={onTimeRate} unit="%" trend={metricTrend(metrics, "On-Time Deliveries")} />
        <KPIcard label="Late Deliveries" value={lateDeliveries} unit="orders" trend={metricTrend(metrics, "Late Deliveries")} />
        <KPIcard label="Cost per Delivery" value={costPerStop} unit="$" trend={metricTrend(metrics, "Cost Per Delivery")} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MiniStat icon={Fuel} label="Fuel Cost" value={`$${formatNumber(fuelCost)}`} />
        <MiniStat icon={Timer} label="Labor Hours" value={formatNumber(laborHours)} />
        <MiniStat icon={Truck} label="Total Cost" value={`$${formatNumber(totalCost)}`} />
      </div>

      <DataEntryForm metrics={metrics} onSaved={load} />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Daily Volume Trend" type="line" data={metricLineData(deliveryMetric)} />
        </div>
        <ChartCard title="Delivery Status Breakdown" type="pie" data={statusData} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Region Breakdown" type="bar" data={regionData} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Top Problem Areas</CardTitle>
            <CardDescription>Simple signals from your latest logistics numbers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {problemAreas.map((problem, index) => (
              <div key={problem.label} className="flex items-start gap-3 rounded-md border bg-white p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                  {index === 0 ? <AlertTriangle className="h-4 w-4" /> : index === 1 ? <MapPinned className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{problem.label}</p>
                  <p className="text-sm text-muted-foreground">{problem.detail}</p>
                </div>
              </div>
            ))}
            {metrics.length === 0 && (
              <div className="flex items-center gap-3 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <PackageCheck className="h-4 w-4" />
                Add logistics metrics to see operational risks here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MetricTable rows={rows} />
    </div>
  );
}
