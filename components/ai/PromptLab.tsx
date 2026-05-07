"use client";

import { FormEvent, useState } from "react";
import { Beaker, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { promptCategories } from "@/lib/ai-team";

export function PromptLab() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("SBD");
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState("both");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function token() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    return data.session?.access_token;
  }

  async function testPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const endpoint = provider === "claude" ? "/api/ai/claude" : provider === "openai" ? "/api/ai/openai" : "/api/ai/team-task";
      const accessToken = await token();
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify(provider === "both" ? { originalPrompt: prompt, taskMode: "Improve Prompt", projectName: "Prompt Lab", source: "prompt_lab" } : { prompt, system: "You are testing and improving a reusable SaaS prompt. Return a stronger version plus notes." })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Prompt test failed");
      setResult(provider === "both" ? data.finalOutput : data.output);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Prompt test failed.");
    } finally {
      setLoading(false);
    }
  }

  async function savePrompt() {
    setMessage("");
    try {
      const accessToken = await token();
      const response = await fetch("/api/prompts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ title, category, prompt, bestVersion: result || prompt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Save failed");
      setMessage("Prompt saved with best version.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    }
  }

  return (
    <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[0.85fr_1.15fr]">
      <form onSubmit={testPrompt} className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Beaker className="h-5 w-5" /></div><div><h2 className="text-2xl font-semibold">Prompt Lab</h2><p className="text-sm text-slate-500">Create, test, compare, and save reusable prompts.</p></div></div>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Prompt title</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Homepage hero generator" required /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Category</Label><Select value={category} onChange={(event) => setCategory(event.target.value)}>{promptCategories.map((item) => <option key={item}>{item}</option>)}</Select></div>
            <div className="space-y-2"><Label>Test with</Label><Select value={provider} onChange={(event) => setProvider(event.target.value)}><option value="openai">ChatGPT</option><option value="claude">Claude</option><option value="both">Both</option></Select></div>
          </div>
          <div className="space-y-2"><Label>Prompt</Label><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-64 w-full rounded-2xl border border-slate-200 p-4 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" required /></div>
          <div className="flex flex-wrap gap-3"><Button disabled={loading} type="submit">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Beaker className="h-4 w-4" />} Test prompt</Button><Button type="button" variant="outline" onClick={savePrompt}><Save className="h-4 w-4" /> Save best version</Button></div>
          {message ? <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{message}</p> : null}
        </div>
      </form>
      <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50">
        <CardHeader><CardTitle>Test result / best version</CardTitle></CardHeader>
        <CardContent><pre className="min-h-[34rem] whitespace-pre-wrap rounded-2xl bg-white p-5 text-sm leading-6 text-slate-700 ring-1 ring-slate-200">{result || "Your ChatGPT, Claude, or combined test result will appear here."}</pre></CardContent>
      </Card>
    </div>
  );
}
