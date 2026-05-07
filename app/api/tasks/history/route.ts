import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server-supabase";

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { data, error } = await auth.supabase.from("ai_tasks").select("id, original_prompt, task_mode, status, created_at, final_output").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return NextResponse.json({ tasks: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Task history failed" }, { status: 500 });
  }
}
