import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-border/80 bg-card text-card-foreground rounded-2xl border shadow-[0_1px_2px_rgb(0_0_0/0.03),0_8px_30px_rgb(0_0_0/0.03)]",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-5 sm:p-6", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />
  );
}

export { Card, CardContent, CardHeader };
