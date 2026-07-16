import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { ComingSoonPage } from "@/features/common/coming-soon-page";

export const metadata: Metadata = { title: "Ajustes" };
export default function Page() {
  return (
    <ComingSoonPage
      title="Ajustes"
      description="Personaliza ArenaGuide para que se adapte a tu forma de competir."
      emptyTitle="Preferencias en desarrollo"
      emptyDescription="Aquí podrás configurar apariencia, ligas favoritas y otras preferencias de la aplicación."
      icon={Settings}
    />
  );
}
