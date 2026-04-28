"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Boxes, PackageCheck, ReceiptText, RotateCcw, ShoppingCart } from "lucide-react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DataEntryForm } from "@/components/dashboard/DataEntryForm";
import { GaugeCard } from "@/components/dashboard/GaugeCard";
import { KPIcard } from "@/components/dashboard/KPIcard";
import { MetricTable } from "@/components/dashboard/MetricTable";
import { ensureDefaultMetrics, getBusiness, getMetrics, getSessionUser, type MetricWithEntries } from "@/lib/data";
import { tableRows } from "@/lib/dashboard";
import {
  averageOrderValue,
  categorySalesData,
  profitEstimate,
  retailLatest,
  retailMixData,
  retailTrend,
  salesTrendData
} from "@/lib/retail";
import type { Business } from "@/types/database";

export function RetailDashboard() {
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

      await ensureDefaultMetrics(businessData.id, "retail");
      setBusiness(businessData);
      setMetrics(await getMetrics(businessData.id, "retail"));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load retail dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading retail dashboard...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

  const sales = retailLatest(metrics, "Sales");
  const orders = retailLatest(metrics, "Orders");
  const expenses = retailLatest(metrics, "Expenses");
  const profit = profitEstimate(metrics);
  const aov = averageOrderValue(metrics);
  const returns = retailLatest(metrics, "Returns");
  const inventorySold = retailLatest(metrics, "Inventory Sold");
  const profitRate = sales ? (profit / sales) * 100 : 0;
  const rows = tableRows(metrics);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm text-muted-foreground">{business?.name ?? "Your business"}</p>
        <h2 className="text-2xl font-semibold">Retail Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIcard label="Sales" value={sales} unit="$" trend={retailTrend(metrics, "Sales")} icon={Banknote} accent="emerald" />
        <KPIcard label="Orders" value={orders} unit="orders" trend={retailTrend(metrics, "Orders")} icon={ShoppingCart} accent="blue" />
        <KPIcard label="Expenses" value={expenses} unit="$" trend={retailTrend(metrics, "Expenses")} icon={ReceiptText} accent="amber" />
        <KPIcard label="Profit Estimate" value={profit} unit="$" trend={retailTrend(metrics, "Profit Estimate")} icon={PackageCheck} accent="violet" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <KPIcard label="Average Order Value" value={aov} unit="$" trend={retailTrend(metrics, "Average Order Value")} icon={ReceiptText} accent="blue" />
        <KPIcard label="Returns" value={returns} unit="orders" trend={retailTrend(metrics, "Returns")} icon={RotateCcw} accent="red" />
        <KPIcard label="Inventory Sold" value={inventorySold} unit="items" trend={retailTrend(metrics, "Inventory Sold")} icon={Boxes} accent="emerald" />
      </div>

      <DataEntryForm metrics={metrics} onSaved={load} />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Sales Trend" description="Latest sales entries over time." type="line" data={salesTrendData(metrics)} height="h-80" />
        </div>
        <GaugeCard
          title="Profit Progress"
          value={Math.max(0, Math.min(profitRate, 100))}
          description="Estimated profit as a share of sales."
          explanation={profitRate >= 30 ? "Healthy margin" : profitRate >= 10 ? "Stable margin" : "Margin needs attention"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Category Sales Breakdown" description="Use notes on Category Sales entries for category names." type="bar" data={categorySalesData(metrics)} />
        <ChartCard title="Retail Mix" description="Sales, expenses, returns, and inventory sold." type="pie" data={retailMixData(metrics)} />
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold">Recent Retail Entries</h3>
        <MetricTable rows={rows} />
      </div>
    </div>
  );
}
