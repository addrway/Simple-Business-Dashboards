import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, FolderKanban, Library, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "AI roles", value: "3", detail: "Strategist, Critic, Synthesizer" },
  { label: "Task modes", value: "7", detail: "From product builds to website audits" },
  { label: "Storage", value: "RLS", detail: "Projects, prompts, and tasks stay user-scoped" }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6 md:p-8">
      <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-100"><Sparkles className="h-4 w-4" /> AI Teamwork Engine</div>
          <h2 className="text-3xl font-semibold md:text-5xl">Turn one task into a polished team-built output.</h2>
          <p className="mt-4 text-slate-300">Create a project, choose a task mode, and watch ChatGPT draft, Claude review, and the final synthesis combine both perspectives.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link href="/workspace">Start a team task <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"><Link href="/prompt-lab">Open Prompt Lab</Link></Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { title: "Projects", icon: FolderKanban, copy: "Organize saved outputs by client, product, campaign, or internal initiative.", href: "/projects" },
          { title: "Prompt Lab", icon: Library, copy: "Test prompts with ChatGPT, Claude, or both and save the strongest version.", href: "/prompt-lab" },
          { title: "Task History", icon: Bot, copy: "Review every AI collaboration step and the final output stored in Supabase.", href: "/task-history" }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader><CardTitle className="flex items-center gap-2"><Icon className="h-4 w-4 text-blue-600" />{item.title}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-500">{item.copy}</p>
                <Button asChild variant="ghost" className="mt-4 px-0"><Link href={item.href}>Open <ArrowRight className="h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Security checklist</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {["OpenAI and Anthropic keys are only read inside server routes.", "Business-critical projects, prompts, and tasks are stored in Supabase, not localStorage.", "Supabase Row Level Security limits users to their own data.", "Admins can view aggregate usage through admin policies and service-role routes."].map((item) => <div key={item} className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{item}</div>)}
        </CardContent>
      </Card>
    </div>
  );
}
