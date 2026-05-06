"use client";

import { FormEvent, useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function ProjectsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    const response = await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) },
      body: JSON.stringify({ name, description })
    });
    const json = await response.json();
    setMessage(response.ok ? `Project created: ${json.project.name}` : json.error);
  }

  return (
    <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[0.8fr_1.2fr]">
      <form onSubmit={createProject} className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><FolderKanban className="h-5 w-5" /></div><div><h2 className="text-2xl font-semibold">Create project</h2><p className="text-sm text-slate-500">Projects hold team tasks and saved final outputs.</p></div></div>
        <div className="space-y-4"><div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(event) => setName(event.target.value)} required /></div><div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(event) => setDescription(event.target.value)} /></div><Button type="submit"><Plus className="h-4 w-4" /> Create project</Button>{message ? <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{message}</p> : null}</div>
      </form>
      <Card><CardHeader><CardTitle>Project workspace</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-slate-500">Use the AI Team Workspace to attach outputs to a project. Supabase RLS ensures signed-in users only query their own project rows. Add a richer project list when connected to your production Supabase instance.</p></CardContent></Card>
    </div>
  );
}
