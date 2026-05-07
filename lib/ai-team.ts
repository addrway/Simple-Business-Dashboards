export const taskModes = [
  "Build Product",
  "Write Copy",
  "Create Code",
  "Research",
  "Improve Prompt",
  "Create Dashboard",
  "Audit Website"
] as const;

export const promptCategories = ["SBD", "Addrway", "Marketing", "Coding", "Product Design", "Research", "Sales Copy"] as const;

export type TaskMode = (typeof taskModes)[number];
export type PromptCategory = (typeof promptCategories)[number];

export type TeamTaskResult = {
  chatgptDraft: string;
  claudeReview: string;
  finalOutput: string;
};

export function strategistSystemPrompt(taskMode: string) {
  return `You are ChatGPT acting as Strategist/Builder in AI Team Workspace. Mode: ${taskMode}. Create a strong, structured first draft. Be decisive, practical, and implementation-focused. Include assumptions, recommended plan, and concrete deliverable content.`;
}

export function criticSystemPrompt(taskMode: string) {
  return `You are Claude acting as Critic/Refiner in AI Team Workspace. Mode: ${taskMode}. Review the original task and ChatGPT draft. Find gaps, risks, unclear claims, missing context, and opportunities. Then provide a refined improvement plan and upgraded content. Be constructive and specific.`;
}

export function synthesisSystemPrompt(taskMode: string) {
  return `You are ChatGPT acting as Final Synthesizer in AI Team Workspace. Mode: ${taskMode}. Combine the ChatGPT draft and Claude review into one polished final answer. Preserve the best ideas, resolve conflicts, and output the finished product. Do not mention internal API details.`;
}

export async function callOpenAIResponse(input: string, system: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      instructions: system,
      input,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const outputText = data.output_text;
  if (typeof outputText === "string" && outputText.trim()) return outputText;

  const content = data.output?.flatMap((item: { content?: { text?: string }[] }) => item.content ?? []).map((item: { text?: string }) => item.text).filter(Boolean).join("\n");
  return content || "OpenAI returned no text output.";
}

export async function callClaudeMessage(input: string, system: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest",
      system,
      max_tokens: 3000,
      messages: [{ role: "user", content: input }]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.content?.map((part: { text?: string }) => part.text).filter(Boolean).join("\n") || "Claude returned no text output.";
}

export async function runTeamTask(originalPrompt: string, taskMode: string): Promise<TeamTaskResult> {
  const chatgptDraft = await callOpenAIResponse(originalPrompt, strategistSystemPrompt(taskMode));
  const claudeReview = await callClaudeMessage(`Original task:\n${originalPrompt}\n\nChatGPT draft:\n${chatgptDraft}`, criticSystemPrompt(taskMode));
  const finalOutput = await callOpenAIResponse(
    `Original task:\n${originalPrompt}\n\nChatGPT draft:\n${chatgptDraft}\n\nClaude review:\n${claudeReview}`,
    synthesisSystemPrompt(taskMode)
  );

  return { chatgptDraft, claudeReview, finalOutput };
}
