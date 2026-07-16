import type { Metadata } from "next";
import { MetaMatchupPage } from "@/features/meta-matchups/components/meta-matchup-page";

export const metadata: Metadata = { title: "Meta" };
export default function Page() {
  return <MetaMatchupPage />;
}
