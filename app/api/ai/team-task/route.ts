import { NextResponse } from "next/server";
import { runTeamTask } from "@/lib/ai-team";
import { requireUser } from "@/lib/server-supabase";

export async function POST(request: Request) {
  try {
    const auth = await requireUser(request);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { projectId, projectName, originalPrompt, taskMode, source } = await request.json();
    if (!originalPrompt || !taskMode) return NextResponse.json({ error: "originalPrompt and taskMode are required" }, { status: 400 });

    let activeProjectId = projectId as string | null;
    if (!activeProjectId && projectName) {
      const { data: project, error: projectError } = await auth.supabase.from("projects").insert({ user_id: auth.user.id, name: projectName }).select("id").single();
      if (projectError) throw projectError;
      activeProjectId = project.id;
    }

    const { data: task, error: taskError } = await auth.supabase.from("ai_tasks").insert({
      user_id: auth.user.id,
      project_id: activeProjectId,
      original_prompt: originalPrompt,
      task_mode: taskMode,
      status: "running"
    }).select("id").single();
    if (taskError) throw taskError;

    const result = await runTeamTask(originalPrompt, taskMode);

    const steps = [
      { ai_task_id: task.id, user_id: auth.user.id, provider: "openai", role_name: "Strategist/Builder", step_order: 1, input: originalPrompt, output: result.chatgptDraft },
      { ai_task_id: task.id, user_id: auth.user.id, provider: "anthropic", role_name: "Critic/Refiner", step_order: 2, input: `${originalPrompt}\n\n${result.chatgptDraft}`, output: result.claudeReview },
      { ai_task_id: task.id, user_id: auth.user.id, provider: "openai", role_name: "Final Synthesizer", step_order: 3, input: `${result.chatgptDraft}\n\n${result.claudeReview}`, output: result.finalOutput }
    ];

    const { error: stepsError } = await auth.supabase.from("ai_task_steps").insert(steps);
    if (stepsError) throw stepsError;

    const { error: updateError } = await auth.supabase.from("ai_tasks").update({
      chatgpt_draft: result.chatgptDraft,
      claude_review: result.claudeReview,
      final_output: result.finalOutput,
      status: "completed"
    }).eq("id", task.id).eq("user_id", auth.user.id);
    if (updateError) throw updateError;

    if (source === "prompt_lab") {
      await auth.supabase.from("prompt_tests").insert({ user_id: auth.user.id, provider: "both", input: originalPrompt, output: result.finalOutput });
    }

    await auth.supabase.from("usage_logs").insert([
      { user_id: auth.user.id, ai_task_id: task.id, provider: "openai", action: "strategist_draft" },
      { user_id: auth.user.id, ai_task_id: task.id, provider: "anthropic", action: "critic_review" },
      { user_id: auth.user.id, ai_task_id: task.id, provider: "openai", action: "final_synthesis" }
    ]);

    return NextResponse.json({ taskId: task.id, projectId: activeProjectId, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Team task failed" }, { status: 500 });
  }
}
