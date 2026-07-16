import type { Metadata } from "next";
import { TeamBuilderPage } from "@/features/team-builder/ui/team-builder-page";

export const metadata: Metadata = { title: "Team Builder" };
export default function Page() {
  return <TeamBuilderPage />;
}
