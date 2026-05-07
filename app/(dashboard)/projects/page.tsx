"use client";

import { FormEvent, useState } from "react";
import { FolderKanban, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  ai_tasks?: { id: string; status: string; created_at: string }[];
};

export default function ProjectsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState("Create a project or refresh to load existing projects from Supabase.");

  async function getToken() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    return data.session?.access_token;
  }

  async function loadProjects() {
    const accessToken = await getToken();
    const response = await fetch("/api/projects/create", { headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) } });
    const json = await response.json();
    if (response.ok) {
      setProjects(json.projects);
      setMessage(`${json.projects.length} projects loaded.`);
    } else {
      setMessage(json.error);
    }
  }

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = await getToken();
    const response = await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ name, description })
    });
    const json = await response.json();
    if (response.ok) {
      setName("");
      setDescription("");
      setMessage(`Project created: ${json.project.name}`);
      await loadProjects();
    } else {
      setMessage(json.error);
    }
  }

  return (
    <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[0.8fr_1.2fr]">
      <form onSubmit={createProject} className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><FolderKanban className="h-5 w-5" /></div><div><h2 className="text-2xl font-semibold">Create project</h2><p className="text-sm text-slate-500">Projects hold team tasks and saved final outputs.</p></div></div>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(event) => setName(event.target.value)} required /></div>
          <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(event) => setDescription(event.target.value)} /></div>
          <div className="flex flex-wrap gap-3"><Button type="submit"><Plus className="h-4 w-4" /> Create project</Button><Button type="button" variant="outline" onClick={loadProjects}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>
          {message ? <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{message}</p> : null}
        </div>
      </form>
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader><CardTitle>{project.name}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-500">{project.description || "No description yet."}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Team tasks</p><p className="mt-1 text-2xl font-semibold">{project.ai_tasks?.length ?? 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Created</p><p className="mt-1 text-sm font-semibold">{new Date(project.created_at).toLocaleDateString()}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
