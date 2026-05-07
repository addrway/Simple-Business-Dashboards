"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bot, CheckCircle2, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { taskModes } from "@/lib/ai-team";

type TeamResult = {
  taskId?: string;
  chatgptDraft: string;
  claudeReview: string;
  finalOutput: string;
};

type ProjectOption = {
  id: string;
  name: string;
};

function OutputCard({ title, role, body, tone }: { title: string; role: string; body: string; tone: "blue" | "purple" | "final" }) {
  const styles = tone === "final" ? "border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-lg" : tone === "purple" ? "border-purple-200" : "border-blue-200";
  return (
    <Card className={styles}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>{title}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{role}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="min-h-64 whitespace-pre-wrap rounded-2xl bg-white/80 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-200">{body || "Run a task to see this collaboration step."}</pre>
      </CardContent>
    </Card>
  );
}

export function TeamWorkspace() {
  const [projectName, setProjectName] = useState("Default Workspace");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [taskMode, setTaskMode] = useState("Build Product");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [result, setResult] = useState<TeamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function getToken() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    return data.session?.access_token;
  }

  async function loadProjects() {
    const token = await getToken();
    if (!token) return;
    const response = await fetch("/api/projects/create", { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (response.ok) setProjects(data.projects ?? []);
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  async function runTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const token = await getToken();
      const response = await fetch("/api/ai/team-task", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ projectId: projectId || null, projectName, taskMode, originalPrompt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Team task failed");
      setResult(data);
      setProjectId(data.projectId ?? projectId);
      setMessage("Team task complete. Save the final output to your project or Prompt Lab.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function savePrompt() {
    if (!result?.finalOutput) return;
    setMessage("");
    try {
      const token = await getToken();
      const response = await fetch("/api/prompts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ title: `${taskMode} final prompt`, category: "Product Design", prompt: originalPrompt, bestVersion: result.finalOutput })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Save failed");
      setMessage("Saved to Prompt Lab.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <form onSubmit={runTask} className="grid gap-6 rounded-3xl border bg-white p-6 shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"><Sparkles className="h-4 w-4" /> Jordan + Pippen workflow</div>
          <h2 className="text-3xl font-semibold">Create a task for your AI team.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">ChatGPT acts as Strategist/Builder, Claude acts as Critic/Refiner, and a final synthesis step combines both into the finished output.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2"><Label>Existing project</Label><Select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Create new project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select></div>
            <div className="space-y-2"><Label>New project name</Label><Input value={projectName} onChange={(event) => setProjectName(event.target.value)} disabled={Boolean(projectId)} /></div>
            <div className="space-y-2"><Label>Task mode</Label><Select value={taskMode} onChange={(event) => setTaskMode(event.target.value)}>{taskModes.map((mode) => <option key={mode}>{mode}</option>)}</Select></div>
          </div>
        </div>
        <div className="space-y-3">
          <Label htmlFor="task">Original task</Label>
          <textarea id="task" required value={originalPrompt} onChange={(event) => setOriginalPrompt(event.target.value)} className="min-h-48 w-full rounded-2xl border border-slate-200 p-4 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Describe the product, copy, code, research, prompt, dashboard, or website audit you want the AI team to complete." />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />} Run AI team</Button>
            <Button type="button" variant="outline" onClick={savePrompt} disabled={!result}><Save className="h-4 w-4" /> Save prompt</Button>
          </div>
          {message ? <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{message}</p> : null}
        </div>
      </form>

      <div className="grid gap-5 xl:grid-cols-3">
        <OutputCard title="ChatGPT Draft" role="Strategist / Builder" body={result?.chatgptDraft ?? ""} tone="blue" />
        <OutputCard title="Claude Review" role="Critic / Refiner" body={result?.claudeReview ?? ""} tone="purple" />
        <OutputCard title="Final Combined Output" role="Finished product" body={result?.finalOutput ?? ""} tone="final" />
      </div>

      <div className="grid gap-3 rounded-3xl bg-slate-950 p-6 text-white md:grid-cols-3">
        {["ChatGPT creates the first high-agency draft.", "Claude reviews both the task and draft for weaknesses.", "Final synthesis resolves tradeoffs into one polished result."].map((step) => <div key={step} className="flex gap-2 text-sm text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{step}</div>)}
      </div>
    </div>
  );
}
