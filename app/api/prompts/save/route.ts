import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server-supabase";

export async function POST(request: Request) {
  try {
    const auth = await requireUser(request);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { title, category, prompt, bestVersion } = await request.json();
    if (!title || !prompt) return NextResponse.json({ error: "title and prompt are required" }, { status: 400 });
    const { data, error } = await auth.supabase.from("saved_prompts").insert({ user_id: auth.user.id, title, category, prompt, best_version: bestVersion ?? prompt }).select("*").single();
    if (error) throw error;
    return NextResponse.json({ prompt: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Prompt save failed" }, { status: 500 });
  }
}
