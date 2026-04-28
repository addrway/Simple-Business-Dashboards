"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataEntryForm } from "@/components/dashboard/DataEntryForm";
import { MetricTable } from "@/components/dashboard/MetricTable";
import { getBusiness, getMetrics, getSessionUser, type MetricWithEntries } from "@/lib/data";
import { tableRows } from "@/lib/dashboard";
import type { Business } from "@/types/database";

export default function DataEntryPage() {
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
      setError(loadError instanceof Error ? loadError.message : "Could not load data entry.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;
  if (loading || !business) return <div className="p-8 text-sm text-muted-foreground">Loading data entry...</div>;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm text-muted-foreground">{business.name}</p>
        <h2 className="text-2xl font-semibold">Data Entry</h2>
      </div>
      <DataEntryForm metrics={metrics} onSaved={load} />
      <MetricTable rows={tableRows(metrics)} />
    </div>
  );
}
