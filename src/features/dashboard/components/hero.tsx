import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border px-5 py-14 text-center shadow-sm sm:px-10 sm:py-20">
      <div className="bg-primary/10 absolute inset-x-1/4 top-0 h-36 rounded-full blur-3xl" />
      <div className="relative mx-auto max-w-3xl">
        <span className="border-border bg-background/70 text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
          <Sparkles className="text-primary size-3.5" />
          Tu ventaja competitiva en Pokémon GO PvP
        </span>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">
          Domina cada combate antes de entrar a la arena.
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-7 text-pretty sm:text-lg">
          Construye equipos, estudia el meta y prepara estrategias con
          herramientas determinísticas diseñadas para jugadores competitivos.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/battle-lab">
            Comenzar <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
