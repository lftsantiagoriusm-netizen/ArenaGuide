import type { ReactNode } from "react";

export function PageTitle({ children }: { readonly children: ReactNode }) {
  return (
    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
      {children}
    </h2>
  );
}
