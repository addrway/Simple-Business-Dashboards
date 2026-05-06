import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

const modes = ["Build Product", "Write Copy", "Create Code", "Research", "Improve Prompt", "Create Dashboard", "Audit Website"];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600"><Sparkles className="h-5 w-5" /></div>
          <div>
            <p className="font-semibold">AI Team Workspace</p>
            <p className="text-xs text-slate-400">ChatGPT × Claude</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="ghost" className="text-white hover:bg-slate-900 hover:text-white"><Link href="/login">Log in</Link></Button>
          <Button asChild><Link href="/signup">Start free</Link></Button>
        </div>
      </nav>

      <section className="grid min-h-[82vh] items-center gap-12 px-6 py-12 md:px-12 lg:grid-cols-[1fr_0.95fr]">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
            <Workflow className="h-4 w-4" /> Not a chatbot — a multi-AI teamwork engine
          </div>
          <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">Make ChatGPT and Claude work like Jordan and Pippen.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">One AI plans and builds. The other critiques and refines. A final synthesis step produces a polished deliverable you can save to projects or Prompt Lab.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild className="h-12 px-6"><Link href="/signup">Create workspace <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" className="h-12 border-slate-700 bg-slate-900 px-6 text-white hover:bg-slate-800"><Link href="/workspace">View workspace</Link></Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Server-side AI calls", "Supabase RLS", "Vercel-ready"].map((item) => <div key={item} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{item}</div>)}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl">
          <div className="grid gap-4">
            <div className="rounded-2xl bg-white p-5 text-slate-950">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Step 1 · ChatGPT Strategist</p>
              <p className="mt-2 text-xl font-semibold">Draft the plan and first deliverable</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-purple-300">Step 2 · Claude Critic</p>
              <p className="mt-2 text-xl font-semibold">Find gaps, refine, and improve</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">Step 3 · Final Output</p>
              <p className="mt-2 text-xl font-semibold">Ship a combined finished product</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {modes.map((mode) => <span key={mode} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{mode}</span>)}
          </div>
          <Bot className="mx-auto mt-8 h-20 w-20 text-blue-300" />
        </div>
      </section>
    </main>
  );
}
