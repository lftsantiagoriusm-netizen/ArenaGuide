import Link from "next/link";
import { Swords } from "lucide-react";
import { cn } from "@/lib/cn";

export function Brand({ compact = false }: { readonly compact?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 font-semibold tracking-tight"
    >
      <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl shadow-sm">
        <Swords className="size-4.5" />
      </span>
      <span className={cn(compact && "sr-only")}>ArenaGuide</span>
    </Link>
  );
}
