import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label: string;
}

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <span className="relative">
        <select
          className={cn(
            "border-border bg-background text-foreground focus:border-primary/50 focus:ring-primary/15 h-12 w-full appearance-none rounded-xl border px-4 pr-10 text-sm transition outline-none focus:ring-2",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        />
      </span>
    </label>
  );
}
