"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/types/navigation";
import { cn } from "@/lib/cn";

interface NavLinkProps extends NavigationItem {
  readonly compact?: boolean;
  readonly mobile?: boolean;
}

export function NavLink({
  label,
  href,
  icon: Icon,
  compact = false,
  mobile = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
        mobile
          ? "flex-1 flex-col gap-1 rounded-none px-1 py-2 text-[11px]"
          : "px-3 py-2.5",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
      )}
    >
      <Icon className={cn("size-4.5 shrink-0", active && "text-primary")} />
      <span className={cn(compact && !mobile && "sr-only")}>{label}</span>
    </Link>
  );
}
