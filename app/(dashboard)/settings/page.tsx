"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardTemplateCard } from "@/components/dashboard/DashboardTemplateCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getBusiness, getSessionUser, upsertBusiness } from "@/lib/data";
import type { DashboardType } from "@/types/database";

const templates = [
  { type: "logistics" as const, title: "Logistics", description: "Deliveries, on-time rate, fuel cost, and daily operations." },
  { type: "retail" as const, title: "Retail", description: "Sales, orders, average ticket, and store performance." },
  { type: "custom" as const, title: "Custom", description: "Flexible metrics for any business workflow." }
];

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [dashboardType, setDashboardType] = useState<DashboardType>("retail");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const user = await getSessionUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUserId(user.id);
        const business = await getBusiness(user.id);
        if (business) {
          setName(business.name);
          setDashboardType(business.dashboard_type);
        }
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load settings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await upsertBusiness(userId, name, dashboardType);
      setMessage("Business profile saved. Next, go to Data Entry and add your first numbers.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save business profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading settings...</div>;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm text-muted-foreground">Workspace setup</p>
        <h2 className="text-2xl font-semibold">Settings</h2>
      </div>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>This keeps SBD tailored to the kind of dashboard you need.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="business-name">Business name</Label>
              <Input id="business-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Lulu's Market" required />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {templates.map((template) => (
                <DashboardTemplateCard
                  key={template.type}
                  {...template}
                  active={dashboardType === template.type}
                  onSelect={setDashboardType}
                />
              ))}
            </div>
            <div>
              <Button type="submit" disabled={saving || !userId}>
                {saving ? "Saving..." : "Save settings"}
              </Button>
              {message && <span className="ml-3 text-sm text-muted-foreground">{message}</span>}
            </div>
          </form>
        </CardContent>
      </Card>
      {message ? (
        <EmptyState
          title="Business profile is ready"
          description="SBD created the starter metrics for your selected dashboard type. Enter a few numbers to activate charts and KPI cards."
          actionLabel="Go to Data Entry"
          onAction={() => router.push("/data-entry")}
        />
      ) : null}
    </div>
  );
}
