"use client";
import { useState } from "react";
import JarvisCore, { JarvisState } from "./JarvisCore";
import JarvisControls from "./JarvisControls";
export default function JarvisShell() {
  const [state, setState] = useState<JarvisState>("idle");
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black text-cyan-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,180,255,0.14),transparent_38%,black_75%)]" />
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <section className="relative z-10 flex flex-col items-center justify-center">
        <div className="h-[620px] w-[620px] max-h-[80vw] max-w-[80vw]">
          <JarvisCore state={state} />
        </div>
        <div className="mt-[-40px] text-center">
          <p className="text-sm uppercase tracking-[0.6em] text-cyan-300/80">
            JARVIS CORE
          </p>
          <p className="mt-3 text-lg text-cyan-100/90">
            {state === "idle" && "Idle — systems alive"}
            {state === "listening" && "Listening..."}
            {state === "thinking" && "Thinking..."}
            {state === "speaking" && "Speaking..."}
          </p>
        </div>
        <JarvisControls state={state} setState={setState} />
      </section>
    </main>
  );
}
