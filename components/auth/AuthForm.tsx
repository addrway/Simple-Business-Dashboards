"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Supabase environment variables are not configured yet.");
      setLoading(false);
      return;
    }

    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-md rounded-3xl border bg-white p-8 shadow-xl">
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">AI Team Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-slate-500">Use Supabase Auth to keep every project, prompt, and task tied to the signed-in user.</p>
      </div>
      <div className="space-y-4">
        {mode === "signup" ? (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Alex Builder" />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
        </div>
      </div>
      {message ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{message}</p> : null}
      <Button disabled={loading} className="mt-6 w-full" type="submit">{loading ? "Working..." : mode === "signup" ? "Sign up" : "Log in"}</Button>
      <p className="mt-5 text-center text-sm text-slate-500">
        {mode === "signup" ? "Already have an account? " : "Need an account? "}
        <Link className="font-semibold text-blue-600" href={mode === "signup" ? "/login" : "/signup"}>{mode === "signup" ? "Log in" : "Sign up"}</Link>
      </p>
    </form>
  );
}
