"use client";

import { useState } from "react";
import { Clock3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type Task = { id: string; original_prompt: string; task_mode: string; status: string; created_at: string; final_output: string | null };

export default function TaskHistoryPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState("Click refresh to load your Supabase task history.");

  async function loadTasks() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    const response = await fetch("/api/tasks/history", { headers: { ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) } });
    const json = await response.json();
    if (response.ok) { setTasks(json.tasks); setMessage(`${json.tasks.length} tasks loaded.`); } else { setMessage(json.error); }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-3xl font-semibold">Task History</h2><p className="mt-2 text-sm text-slate-500">Every teamwork run stores the draft, critique, synthesis, and step records.</p></div><Button onClick={loadTasks}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>
      <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{message}</p>
      <div className="grid gap-4">
        {tasks.map((task) => <Card key={task.id}><CardHeader><CardTitle className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-blue-600" />{task.task_mode} · {task.status}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-500">{new Date(task.created_at).toLocaleString()}</p><p className="mt-3 text-sm font-medium text-slate-700">{task.original_prompt}</p><pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{task.final_output}</pre></CardContent></Card>)}
      </div>
    </div>
  );
}
