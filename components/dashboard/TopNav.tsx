"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function TopNav({ title }: { title?: string }) {
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="h-9 w-9 p-0 lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Simple Business Dashboard</p>
          <h1 className="text-lg font-semibold">{title ?? "Command Center"}</h1>
        </div>
      </div>
      <Button variant="outline" onClick={signOut}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </header>
  );
}
