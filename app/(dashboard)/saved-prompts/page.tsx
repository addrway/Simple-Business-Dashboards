import { Library } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { promptCategories } from "@/lib/ai-team";

export default function SavedPromptsPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div><h2 className="text-3xl font-semibold">Saved Prompts</h2><p className="mt-2 text-sm text-slate-500">Reusable prompts saved from Prompt Lab and team-task final outputs.</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {promptCategories.map((category) => <Card key={category}><CardHeader><CardTitle className="flex items-center gap-2"><Library className="h-4 w-4 text-blue-600" />{category}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-500">Prompts tagged as {category} are stored in the saved_prompts table and protected by user-scoped RLS policies.</p></CardContent></Card>)}
      </div>
    </div>
  );
}
