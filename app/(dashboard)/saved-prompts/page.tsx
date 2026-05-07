"use client";

import { useState } from "react";
import { Library, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type SavedPrompt = {
  id: string;
  title: string;
  category: string;
  prompt: string;
  best_version: string | null;
  created_at: string;
};

export default function SavedPromptsPage() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [message, setMessage] = useState("Click refresh to load your saved prompts from Supabase.");

  async function loadPrompts() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    const response = await fetch("/api/prompts/save", { headers: { ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) } });
    const json = await response.json();
    if (response.ok) {
      setPrompts(json.prompts);
      setMessage(`${json.prompts.length} saved prompts loaded.`);
    } else {
      setMessage(json.error);
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-3xl font-semibold">Saved Prompts</h2><p className="mt-2 text-sm text-slate-500">Reusable prompts saved from Prompt Lab and team-task final outputs.</p></div>
        <Button onClick={loadPrompts}><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </div>
      <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{message}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {prompts.map((prompt) => (
          <Card key={prompt.id}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Library className="h-4 w-4 text-blue-600" />{prompt.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">{prompt.category}</p>
              <p className="mt-3 text-sm font-medium text-slate-700">Original prompt</p>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{prompt.prompt}</pre>
              <p className="mt-4 text-sm font-medium text-slate-700">Best version</p>
              <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-blue-50 p-4 text-sm text-slate-700">{prompt.best_version}</pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
