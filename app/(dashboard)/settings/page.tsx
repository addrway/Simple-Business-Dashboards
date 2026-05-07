import { KeyRound, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div><h2 className="text-3xl font-semibold">Settings</h2><p className="mt-2 text-sm text-slate-500">Configure authentication, AI providers, and deployment environment variables.</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-blue-600" />Environment variables</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-slate-600"><p>NEXT_PUBLIC_SUPABASE_URL</p><p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p><p>SUPABASE_SERVICE_ROLE_KEY</p><p>OPENAI_API_KEY</p><p>ANTHROPIC_API_KEY</p><p>OPENAI_MODEL</p><p>ANTHROPIC_MODEL</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-4 w-4 text-blue-600" />Security defaults</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-slate-500">AI provider keys never ship to the browser. Frontend requests include the Supabase access token, server routes verify the user, and database RLS scopes content to that user.</p></CardContent></Card>
      </div>
    </div>
  );
}
