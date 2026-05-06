import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server-supabase";

export async function POST(request: Request) {
  try {
    const auth = await requireUser(request);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    const { data, error } = await auth.supabase.from("projects").insert({ user_id: auth.user.id, name, description }).select("*").single();
    if (error) throw error;
    return NextResponse.json({ project: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Project create failed" }, { status: 500 });
  }
}
