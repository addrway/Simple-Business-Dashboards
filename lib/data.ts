"use client";

import { supabase } from "@/lib/supabase";
import type { Business, CustomChart, DashboardType, Metric, MetricEntry } from "@/types/database";

export type MetricWithEntries = Metric & { metric_entries: MetricEntry[] };

export async function getSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getBusiness(userId: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as Business | null;
}

export async function upsertBusiness(userId: string, name: string, dashboardType: DashboardType) {
  const existing = await getBusiness(userId);
  if (existing) {
    const { data, error } = await supabase
      .from("businesses")
      .update({ name, dashboard_type: dashboardType })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    await ensureDefaultMetrics(data.id, dashboardType);
    await ensureUserDashboard(userId, data.id, dashboardType);
    return data as Business;
  }

  const { data, error } = await supabase
    .from("businesses")
    .insert({ user_id: userId, name, dashboard_type: dashboardType })
    .select()
    .single();

  if (error) throw error;
  await ensureDefaultMetrics(data.id, dashboardType);
  await ensureUserDashboard(userId, data.id, dashboardType);
  return data as Business;
}

async function ensureUserDashboard(userId: string, businessId: string, dashboardType: DashboardType) {
  const { data: existing, error: readError } = await supabase
    .from("user_dashboards")
    .select("id")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .eq("type", dashboardType)
    .maybeSingle();
  if (readError) throw readError;
  if (existing) return;

  const { data: template } = await supabase
    .from("dashboard_templates")
    .select("id")
    .eq("type", dashboardType)
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("user_dashboards").insert({
    user_id: userId,
    business_id: businessId,
    template_id: template?.id ?? null,
    title: `${dashboardType[0].toUpperCase()}${dashboardType.slice(1)} Dashboard`,
    type: dashboardType
  });
  if (error) throw error;
}

export async function ensureDefaultMetrics(businessId: string, dashboardType: DashboardType) {
  const metricSeeds: Record<DashboardType, Array<{ name: string; unit: string }>> = {
    logistics: [
      { name: "Deliveries", unit: "orders" },
      { name: "On-time Rate", unit: "%" },
      { name: "Fuel Cost", unit: "$" }
    ],
    retail: [
      { name: "Sales", unit: "$" },
      { name: "Orders", unit: "orders" },
      { name: "Average Ticket", unit: "$" }
    ],
    custom: [
      { name: "Revenue", unit: "$" },
      { name: "Customers", unit: "people" },
      { name: "Completed Work", unit: "items" }
    ]
  };

  const { data: existing, error: readError } = await supabase
    .from("metrics")
    .select("name")
    .eq("business_id", businessId);
  if (readError) throw readError;

  const names = new Set((existing ?? []).map((metric) => metric.name));
  const inserts = metricSeeds[dashboardType]
    .filter((metric) => !names.has(metric.name))
    .map((metric) => ({ ...metric, business_id: businessId, dashboard_type: dashboardType }));

  if (inserts.length === 0) return;
  const { error } = await supabase.from("metrics").insert(inserts);
  if (error) throw error;
}

export async function getMetrics(businessId: string, dashboardType?: DashboardType) {
  let query = supabase
    .from("metrics")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (dashboardType) {
    query = query.eq("dashboard_type", dashboardType);
  }

  const { data: metrics, error } = await query;
  if (error) throw error;

  const metricRows = (metrics ?? []) as Metric[];
  if (metricRows.length === 0) return [];

  const { data: entries, error: entriesError } = await supabase
    .from("metric_entries")
    .select("*")
    .in(
      "metric_id",
      metricRows.map((metric) => metric.id)
    )
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (entriesError) throw entriesError;

  const entriesByMetric = new Map<string, MetricEntry[]>();
  for (const entry of ((entries ?? []) as MetricEntry[])) {
    const metricEntries = entriesByMetric.get(entry.metric_id) ?? [];
    metricEntries.push(entry);
    entriesByMetric.set(entry.metric_id, metricEntries);
  }

  return metricRows.map((metric) => ({
    ...metric,
    metric_entries: entriesByMetric.get(metric.id) ?? []
  }));
}

export async function saveMetricEntry(metricId: string, value: number, entryDate: string, note?: string) {
  const { error } = await supabase
    .from("metric_entries")
    .insert({ metric_id: metricId, value, entry_date: entryDate, note: note || null });
  if (error) throw error;
}

export async function getCustomCharts(userId: string, businessId: string) {
  const { data, error } = await supabase
    .from("custom_charts")
    .select("*")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CustomChart[];
}

export async function createCustomChart(userId: string, businessId: string, title: string, chartType: string, metricId?: string) {
  const { error } = await supabase
    .from("custom_charts")
    .insert({ user_id: userId, business_id: businessId, title, chart_type: chartType, metric_id: metricId || null });
  if (error) throw error;
}
