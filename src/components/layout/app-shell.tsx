"use client";

import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import { Navbar } from "@/components/navigation/navbar";
import { Sidebar } from "@/components/navigation/sidebar";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/store/ui-store";

export function AppShell({ children }: { readonly children: ReactNode }) {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  return (
    <>
      <Sidebar />
      <Navbar />
      <div
        className={cn(
          "flex min-h-dvh flex-col pt-16 pb-17 transition-[padding] lg:pb-0 lg:pl-64",
          collapsed && "lg:pl-20",
        )}
      >
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <BottomNavigation />
    </>
  );
}
