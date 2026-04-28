"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { saveMetricEntry, type MetricWithEntries } from "@/lib/data";

export function DataEntryForm({ metrics, onSaved }: { metrics: MetricWithEntries[]; onSaved: () => void | Promise<void> }) {
  const [metricId, setMetricId] = useState(metrics[0]?.id ?? "");
  const [value, setValue] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
    if (!metricId) {
      setMessage("Create a metric before saving an entry.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await saveMetricEntry(metricId, Number(value), entryDate, note);
      setValue("");
      setNote("");
      setMessage("Saved. Your charts are updated.");
      await onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Data Entry</CardTitle>
        <CardDescription>Pick one metric, add one number, and SBD handles the dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="metric">Metric</Label>
            <Select id="metric" value={metricId} onChange={(event) => setMetricId(event.target.value)} required>
              {metrics.length === 0 && <option value="">No metrics yet</option>}
              {metrics.map((metric) => (
                <option key={metric.id} value={metric.id}>
                  {metric.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input id="value" type="number" step="0.01" value={value} onChange={(event) => setValue(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entry-date">Date</Label>
            <Input id="entry-date" type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input id="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" />
          </div>
          <div className="md:col-span-4">
            <Button type="submit" disabled={saving || metrics.length === 0}>
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Save number"}
            </Button>
            {message && <span className="ml-3 text-sm text-muted-foreground">{message}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
