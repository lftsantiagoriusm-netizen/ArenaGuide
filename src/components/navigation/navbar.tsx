"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Brand } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/store/ui-store";

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  useEffect(() => setMounted(true), []);
  return (
    <header
      className={cn(
        "border-border/80 bg-background/80 fixed inset-x-0 top-0 z-20 h-16 border-b backdrop-blur-xl transition-[left] lg:left-64",
        collapsed && "lg:left-20",
      )}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="lg:hidden">
          <Brand />
        </div>
        <p className="text-muted-foreground hidden text-sm lg:block">
          Entrena mejor. Compite con claridad.
        </p>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cambiar tema"
          disabled={!mounted}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
