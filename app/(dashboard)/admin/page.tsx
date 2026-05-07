"use client";

import { useState } from "react";
import { RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type Totals = {
  totalTasks: number | null;
  openAiCalls: number | null;
  claudeCalls: number | null;
  savedPrompts: number | null;
};

export default function AdminPage() {
  const [totals, setTotals] = useState<Totals>({ totalTasks: null, openAiCalls: null, claudeCalls: null, savedPrompts: null });
  const [message, setMessage] = useState("Admin totals require profiles.role = 'admin' and SUPABASE_SERVICE_ROLE_KEY on the server.");

  async function loadUsage() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    const response = await fetch("/api/admin/usage", { headers: { ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) } });
    const json = await response.json();
    if (response.ok) {
      setTotals(json.totals);
      setMessage("Usage totals loaded.");
    } else {
      setMessage(json.error);
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-3xl font-semibold">Admin Dashboard</h2><p className="mt-2 text-sm text-slate-500">Admins can view aggregate usage totals without exposing user-owned content broadly.</p></div><Button onClick={loadUsage}><RefreshCw className="h-4 w-4" /> Load totals</Button></div>
      <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{message}</p>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total tasks", totals.totalTasks],
          ["OpenAI calls", totals.openAiCalls],
          ["Claude calls", totals.claudeCalls],
          ["Saved prompts", totals.savedPrompts]
        ].map(([label, value]) => <Card key={label as string}><CardContent className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value ?? "—"}</p><p className="mt-2 text-sm text-slate-500">Aggregated from Supabase.</p></CardContent></Card>)}
      </div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" />Access model</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-slate-500">The profiles.role column supports user and admin access. The admin API verifies the signed-in user, then uses the service role key only on the server to count usage rows.</p></CardContent></Card>
    </div>
  );
}
