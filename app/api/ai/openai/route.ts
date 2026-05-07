import { NextResponse } from "next/server";
import { callOpenAIResponse } from "@/lib/ai-team";
import { requireUser } from "@/lib/server-supabase";

export async function POST(request: Request) {
  try {
    const auth = await requireUser(request);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { prompt, system } = await request.json();
    if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    const output = await callOpenAIResponse(prompt, system ?? "You are a helpful SaaS AI assistant.");
    await auth.supabase.from("prompt_tests").insert({ user_id: auth.user.id, provider: "openai", input: prompt, output });
    await auth.supabase.from("usage_logs").insert({ user_id: auth.user.id, provider: "openai", action: "prompt_test" });
    return NextResponse.json({ output });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "OpenAI route failed" }, { status: 500 });
  }
}
