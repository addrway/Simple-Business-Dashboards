import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server-supabase";

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { data, error } = await auth.supabase
      .from("saved_prompts")
      .select("id, title, category, prompt, best_version, tags, created_at, updated_at")
      .eq("user_id", auth.user.id)
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ prompts: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Prompt list failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser(request);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { title, category, prompt, bestVersion, tags } = await request.json();
    if (!title || !prompt) return NextResponse.json({ error: "title and prompt are required" }, { status: 400 });
    const { data, error } = await auth.supabase
      .from("saved_prompts")
      .insert({ user_id: auth.user.id, title, category, prompt, best_version: bestVersion ?? prompt, tags: tags ?? [] })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ prompt: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Prompt save failed" }, { status: 500 });
  }
}
