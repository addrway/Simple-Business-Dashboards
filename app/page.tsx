import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="grid min-h-[92vh] items-center gap-10 px-6 py-10 md:px-12 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
            <BarChart3 className="h-4 w-4" />
            Simple Business Dashboard
          </div>
          <h1 className="text-4xl font-semibold tracking-normal md:text-6xl">SBD</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Premium dashboards for small businesses that want clear numbers, clean charts, and no technical setup.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/signup">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-slate-950 p-5 shadow-soft">
          <div className="grid gap-3 sm:grid-cols-3">
            {["Sales", "Deliveries", "Customers"].map((label, index) => (
              <div key={label} className="rounded-md bg-white p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{["$18k", "942", "128"][index]}</p>
                <p className="mt-3 text-xs text-emerald-700">Up {["12", "8", "19"][index]}%</p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-72 rounded-md bg-white p-5">
            <div className="flex h-full items-end gap-3">
              {[44, 72, 58, 90, 66, 86, 98].map((height, index) => (
                <div key={index} className="flex flex-1 items-end rounded bg-emerald-100">
                  <div className="w-full rounded bg-emerald-700" style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-white sm:grid-cols-3">
            {["Logistics", "Retail", "Custom"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
