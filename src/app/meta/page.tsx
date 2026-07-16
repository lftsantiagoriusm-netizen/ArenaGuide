import type { Metadata } from "next";
import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { ComingSoonPage } from "@/features/common/coming-soon-page";

export const metadata: Metadata = { title: "Meta" };
export default function Page() {
  return (
    <ComingSoonPage
      title="Meta"
      description="Entiende qué Pokémon definen el entorno competitivo de cada liga."
      emptyTitle="El meta está tomando forma"
      emptyDescription="Próximamente podrás consultar rankings, tendencias y amenazas prioritarias por liga."
      icon={ChartNoAxesColumnIncreasing}
    />
  );
}
