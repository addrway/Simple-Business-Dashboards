"use client";

import { FormEvent, useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createCustomChart, type MetricWithEntries } from "@/lib/data";

export function CustomGraphForm({
  userId,
  businessId,
  metrics,
  onCreated
}: {
  userId: string;
  businessId: string;
  metrics: MetricWithEntries[];
  onCreated: () => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [chartType, setChartType] = useState("line");
  const [metricId, setMetricId] = useState(metrics[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!metricId && metrics[0]) {
      setMetricId(metrics[0].id);
    }
    if (metricId && !metrics.some((metric) => metric.id === metricId)) {
      setMetricId(metrics[0]?.id ?? "");
    }
  }, [metricId, metrics]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!metricId) return;
    setSaving(true);
    try {
      await createCustomChart(userId, businessId, title, chartType, metricId);
      setTitle("");
      await onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Graph Builder</CardTitle>
        <CardDescription>Create a simple graph from any saved metric.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-4" onSubmit={submit}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="chart-title">Graph name</Label>
            <Input id="chart-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Weekly revenue" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chart-type">Chart</Label>
            <Select id="chart-type" value={chartType} onChange={(event) => setChartType(event.target.value)}>
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="chart-metric">Metric</Label>
            <Select id="chart-metric" value={metricId} onChange={(event) => setMetricId(event.target.value)}>
              {metrics.length === 0 && <option value="">No metrics yet</option>}
              {metrics.map((metric) => (
                <option key={metric.id} value={metric.id}>
                  {metric.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-4">
            <Button type="submit" disabled={saving || metrics.length === 0}>
              <PlusCircle className="h-4 w-4" />
              {saving ? "Creating..." : "Create graph"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
