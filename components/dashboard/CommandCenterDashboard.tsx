"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Gauge, PackageCheck, Truck } from "lucide-react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { GaugeCard } from "@/components/dashboard/GaugeCard";
import { KPIcard } from "@/components/dashboard/KPIcard";
import { MetricTable } from "@/components/dashboard/MetricTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBusiness, getMetrics, getSessionUser, type MetricWithEntries } from "@/lib/data";
import { entryCount, hasEntries, latestMetricData, latestValue, lineData, tableRows, trend } from "@/lib/dashboard";
import { deliveryStatusData, findMetric, onTimeDeliveryRate, regionBreakdownData } from "@/lib/logistics";
import { averageOrderValue, categorySalesData, findRetailMetric, profitEstimate, salesTrendData } from "@/lib/retail";
import type { Business } from "@/types/database";

function firstMetric(metrics: MetricWithEntries[], names: string[]) {
  for (const name of names) {
    const metric = metrics.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (metric) return metric;
  }
  return undefined;
}

function metricValue(metric?: MetricWithEntries) {
  return metric ? latestValue(metric) : 0;
}

function metricTrendValue(metric?: MetricWithEntries) {
  return metric ? trend(metric) : 0;
}

export function CommandCenterDashboard() {
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
      setMetrics(await getMetrics(businessData.id));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load command center.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading command center...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

  const deliveryMetric = findMetric(metrics, "Deliveries");
  const salesMetric = findRetailMetric(metrics, "Sales");
  const ordersMetric = firstMetric(metrics, ["Orders", "Deliveries"]);
  const primaryTrendMetric = salesMetric ?? deliveryMetric ?? metrics[0];
  const onTimeRate = onTimeDeliveryRate(metrics);
  const profit = profitEstimate(metrics);
  const latestMix = latestMetricData(metrics).filter((item) => item.value > 0).slice(0, 6);
  const hasSavedEntries = hasEntries(metrics);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm text-muted-foreground">{business?.name ?? "Your business"}</p>
        <h2 className="text-2xl font-semibold">Command Center</h2>
      </div>

      {metrics.length === 0 ? (
        <EmptyState
          title="Set up your business profile"
          description="Open Settings, enter your business name, and choose Logistics, Retail, or Custom to create starter metrics."
          actionLabel="Open Settings"
          onAction={() => router.push("/settings")}
        />
      ) : !hasSavedEntries ? (
        <EmptyState
          title="Your dashboard is ready for data"
          description="Go to Data Entry and save your first numbers. KPI cards, charts, and tables will update from Supabase automatically."
          actionLabel="Enter Data"
          onAction={() => router.push("/data-entry")}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIcard label="Deliveries" value={metricValue(deliveryMetric)} unit="orders" trend={metricTrendValue(deliveryMetric)} icon={Truck} accent="blue" />
        <KPIcard label="Sales" value={metricValue(salesMetric)} unit="$" trend={metricTrendValue(salesMetric)} icon={Banknote} accent="emerald" />
        <KPIcard label="Orders / Volume" value={metricValue(ordersMetric)} unit="orders" trend={metricTrendValue(ordersMetric)} icon={PackageCheck} accent="violet" />
        <KPIcard label="Profit Estimate" value={profit} unit="$" trend={metricTrendValue(findRetailMetric(metrics, "Profit Estimate"))} icon={Gauge} accent="amber" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title={primaryTrendMetric ? `${primaryTrendMetric.name} Trend` : "Business Trend"}
            description="The clearest current activity signal for this business."
            type="line"
            data={primaryTrendMetric ? lineData(primaryTrendMetric) : salesTrendData(metrics)}
            height="h-80"
          />
        </div>
        <GaugeCard
          title={deliveryMetric ? "On-Time Delivery" : "Profit Progress"}
          value={deliveryMetric ? onTimeRate : Math.max(0, Math.min(metricValue(salesMetric) ? (profit / metricValue(salesMetric)) * 100 : 0, 100))}
          description={deliveryMetric ? "Latest delivery service level." : "Estimated profit as a share of sales."}
          explanation={deliveryMetric ? "Simple service health" : "Simple margin health"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Latest KPI Mix" description="Most recent values across dashboards." type="bar" data={latestMix} />
        <ChartCard title="Status Breakdown" description="Delivery status when logistics data exists." type="pie" data={deliveryStatusData(metrics)} />
        <ChartCard
          title="Area / Category Performance"
          description="Region volume first, then retail category sales."
          type="bar"
          data={regionBreakdownData(metrics).length ? regionBreakdownData(metrics) : categorySalesData(metrics)}
        />
      </div>

      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
        <CardHeader>
          <CardTitle>Everyday Summary</CardTitle>
          <CardDescription>A short, simple read on the business today.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Average order value</p>
            <p className="mt-2 text-2xl font-semibold">${averageOrderValue(metrics).toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Tracked metrics</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Recent entries</p>
            <p className="mt-2 text-2xl font-semibold">{entryCount(metrics)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-base font-semibold">Recent Entries</h3>
        <MetricTable rows={tableRows(metrics)} />
      </div>
    </div>
  );
}
