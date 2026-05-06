import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div><h2 className="text-3xl font-semibold">Admin Dashboard</h2><p className="mt-2 text-sm text-slate-500">Admins can view aggregate usage totals without exposing user-owned content broadly.</p></div>
      <div className="grid gap-4 md:grid-cols-3">{["Total tasks", "OpenAI calls", "Claude calls"].map((item) => <Card key={item}><CardContent className="p-5"><p className="text-sm text-slate-500">{item}</p><p className="mt-2 text-3xl font-semibold">—</p><p className="mt-2 text-sm text-slate-500">Connected through usage_logs.</p></CardContent></Card>)}</div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" />Access model</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-slate-500">The profiles.role column supports user and admin access. RLS policies allow admins to view usage totals while user content remains scoped to the owner.</p></CardContent></Card>
    </div>
  );
}
