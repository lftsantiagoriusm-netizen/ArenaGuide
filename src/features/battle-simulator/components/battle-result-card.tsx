import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SimulationResult } from "../domain/types";

export function BattleResultCard({
  result,
}: {
  readonly result: SimulationResult;
}) {
  const winnerName =
    result.winner === "a" || result.winner === "b"
      ? result.combatants[result.winner].pokemon.name
      : result.winner === "draw"
        ? "Empate"
        : "Sin resultado válido";
  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <p className="text-primary text-xs font-medium tracking-wide uppercase">
            Resultado determinístico
          </p>
          <h2 className="text-2xl font-semibold">{winnerName}</h2>
          <p className="text-muted-foreground text-sm">
            {result.turns} turnos · Dataset mecánico provisional v1
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(["a", "b"] as const).map((id) => {
            const state = result.combatants[id];
            return (
              <div key={id} className="bg-accent/60 rounded-xl p-4">
                <h3 className="font-semibold">{state.pokemon.name}</h3>
                <dl className="text-muted-foreground mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt>Ataque efectivo</dt>
                    <dd className="text-foreground">
                      {state.pokemon.stats.attack.toFixed(1)}
                    </dd>
                  </div>
                  <div>
                    <dt>Defensa efectiva</dt>
                    <dd className="text-foreground">
                      {state.pokemon.stats.defense.toFixed(1)}
                    </dd>
                  </div>
                  <div>
                    <dt>HP / CP</dt>
                    <dd className="text-foreground">
                      {state.pokemon.stats.hp} / {state.pokemon.stats.cp}
                    </dd>
                  </div>
                  <div>
                    <dt>Vida</dt>
                    <dd className="text-foreground">
                      {result.remainingHpPercent[id]}%
                    </dd>
                  </div>
                  <div>
                    <dt>Energía</dt>
                    <dd className="text-foreground">{state.energy}</dd>
                  </div>
                  <div>
                    <dt>Daño</dt>
                    <dd className="text-foreground">{state.totalDamage}</dd>
                  </div>
                  <div>
                    <dt>Escudos</dt>
                    <dd className="text-foreground">{state.shieldsUsed}</dd>
                  </div>
                  <div>
                    <dt>Rápidos</dt>
                    <dd className="text-foreground">{state.fastMovesUsed}</dd>
                  </div>
                  <div>
                    <dt>Cargados</dt>
                    <dd className="text-foreground">
                      {state.chargedMovesUsed}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Por qué terminó así</h2>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground grid gap-2 text-sm">
            {result.explanation.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <details className="border-border bg-card rounded-2xl border p-5">
        <summary className="cursor-pointer font-semibold">
          Línea temporal ({result.timeline.length} eventos)
        </summary>
        <ol className="border-border text-muted-foreground mt-4 max-h-96 space-y-2 overflow-auto border-l pl-4 text-xs">
          {result.timeline.map((event, index) => (
            <li key={`${event.turn}-${event.type}-${index}`}>
              <span className="text-foreground font-medium">T{event.turn}</span>{" "}
              · {event.message}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
