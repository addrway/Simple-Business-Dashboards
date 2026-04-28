import type { ElementType } from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = ArrowRight,
  title,
  description,
  actionLabel,
  onAction
}: {
  icon?: ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-slate-950">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {actionLabel && onAction ? (
          <Button type="button" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
