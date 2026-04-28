"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardType } from "@/types/database";

export function DashboardTemplateCard({
  type,
  title,
  description,
  active,
  onSelect
}: {
  type: DashboardType;
  title: string;
  description: string;
  active: boolean;
  onSelect: (type: DashboardType) => void;
}) {
  return (
    <Card className={active ? "border-emerald-600 ring-2 ring-emerald-100" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          {active && <CheckCircle2 className="h-5 w-5 text-emerald-700" />}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant={active ? "default" : "outline"} className="w-full" onClick={() => onSelect(type)}>
          {active ? "Selected" : "Choose"}
        </Button>
      </CardContent>
    </Card>
  );
}
