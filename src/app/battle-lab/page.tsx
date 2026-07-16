import type { Metadata } from "next";
import { BattleLabPage } from "@/features/battle-lab/battle-lab-page";

export const metadata: Metadata = { title: "Battle Lab" };
export default function Page() {
  return <BattleLabPage />;
}
