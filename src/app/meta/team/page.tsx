import type { Metadata } from "next";
import { TeamMetaCoveragePage } from "@/features/team-meta-coverage/components/team-meta-coverage-page";

export const metadata: Metadata = { title: "Cobertura del equipo" };

export default function Page() {
  return <TeamMetaCoveragePage />;
}
