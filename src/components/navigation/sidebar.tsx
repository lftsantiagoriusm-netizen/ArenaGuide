"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Brand } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/store/ui-store";
import { NavLink } from "./nav-link";

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  return (
    <aside
      className={cn(
        "border-border bg-background/95 fixed inset-y-0 left-0 z-30 hidden border-r backdrop-blur lg:flex lg:flex-col",
        sidebarCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-5">
        <Brand compact={sidebarCollapsed} />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={
            sidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"
          }
        >
          {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>
      <nav className="flex flex-1 flex-col justify-between p-3">
        <div className="space-y-1">
          {primaryNavigation.map((item) => (
            <NavLink key={item.href} {...item} compact={sidebarCollapsed} />
          ))}
        </div>
        <div className="space-y-1">
          {secondaryNavigation.map((item) => (
            <NavLink key={item.href} {...item} compact={sidebarCollapsed} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
