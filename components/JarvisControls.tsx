"use client";
import { Mic, Brain, Volume2, Power } from "lucide-react";
import { JarvisState } from "./JarvisCore";
type Props = {
  state: JarvisState;
  setState: (state: JarvisState) => void;
};
export default function JarvisControls({ state, setState }: Props) {
  const states: JarvisState[] = ["idle", "listening", "thinking", "speaking"];
  function cycleState() {
    const currentIndex = states.indexOf(state);
    const next = states[(currentIndex + 1) % states.length];
    setState(next);
    // Future connection points:
    // - Start voice input here
    // - Send audio/text to OpenJarvis backend
    // - Route requests to Ollama, OpenAI, Claude, or local agents
    // - Save conversation/memory to Supabase or another memory system
  }
  const Icon =
    state === "idle"
      ? Power
      : state === "listening"
      ? Mic
      : state === "thinking"
      ? Brain
      : Volume2;
  return (
    <button
      onClick={cycleState}
      className="mt-10 flex items-center gap-3 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-7 py-4 text-cyan-100 shadow-[0_0_35px_rgba(0,200,255,0.35)] backdrop-blur-xl transition hover:scale-105 hover:bg-cyan-300/20"
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm uppercase tracking-[0.35em]">
        {state === "idle" ? "Activate" : state}
      </span>
    </button>
  );
}
