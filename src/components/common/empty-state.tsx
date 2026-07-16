import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <Card className="grid min-h-72 place-items-center border-dashed p-8 text-center">
      <div className="max-w-sm">
        <span className="bg-accent text-primary mx-auto mb-5 grid size-12 place-items-center rounded-xl">
          <Icon className="size-5" />
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {description}
        </p>
      </div>
    </Card>
  );
}
