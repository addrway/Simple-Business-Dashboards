import { NextResponse } from "next/server";
import { createSupabaseAdminClient, requireAdmin } from "@/lib/server-supabase";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const admin = createSupabaseAdminClient();
    const [{ count: totalTasks }, { count: openAiCalls }, { count: claudeCalls }, { count: savedPrompts }] = await Promise.all([
      admin.from("ai_tasks").select("id", { count: "exact", head: true }),
      admin.from("usage_logs").select("id", { count: "exact", head: true }).eq("provider", "openai"),
      admin.from("usage_logs").select("id", { count: "exact", head: true }).eq("provider", "anthropic"),
      admin.from("saved_prompts").select("id", { count: "exact", head: true })
    ]);

    return NextResponse.json({ totals: { totalTasks, openAiCalls, claudeCalls, savedPrompts } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Admin usage failed" }, { status: 500 });
  }
}
