import type { MatchupSimulationResult } from "../domain/types";

const labels = {
  dominant: "Dominante",
  favorable: "Favorable",
  close: "Cerrado",
  unfavorable: "Desfavorable",
  "very-unfavorable": "Muy desfavorable",
  draw: "Empate",
  invalid: "Inválido",
} as const;

export function MatchupCard({
  item,
}: {
  readonly item: MatchupSimulationResult;
}) {
  const simulation = item.simulation;
  return (
    <details className="border-border bg-card rounded-2xl border p-5 shadow-sm">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-xs">
              Rival · peso {item.opponent.weight}
            </p>
            <h3 className="mt-1 font-semibold">{item.opponent.name}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {item.failure?.message ?? simulation?.explanation.at(-1)}
            </p>
          </div>
          <div className="text-right">
            <span className="bg-accent rounded-full px-2.5 py-1 text-xs font-medium">
              {labels[item.classification]}
            </span>
            <p className="text-muted-foreground mt-2 text-xs">
              {simulation
                ? `${simulation.remainingHpPercent.a}% HP · ${simulation.turns} turnos`
                : "Sin resultado"}
            </p>
          </div>
        </div>
      </summary>
      {simulation ? (
        <div className="border-border mt-5 grid gap-4 border-t pt-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <BuildDetails label="Analizado" state={simulation.combatants.a} />
            <BuildDetails label="Rival" state={simulation.combatants.b} />
          </div>
          <div>
            <h4 className="font-medium">Explicación</h4>
            <ul className="text-muted-foreground mt-2">
              {simulation.explanation.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
          <details>
            <summary className="cursor-pointer font-medium">
              Timeline completo ({simulation.timeline.length})
            </summary>
            <ol className="border-border text-muted-foreground mt-2 max-h-72 overflow-auto border-l pl-3 text-xs">
              {simulation.timeline.map((event, index) => (
                <li key={`${event.turn}-${index}`}>
                  T{event.turn} · {event.message}
                </li>
              ))}
            </ol>
          </details>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Resultado basado en Mechanics Fixture v1 provisional.
          </p>
        </div>
      ) : null}
    </details>
  );
}

function BuildDetails({
  label,
  state,
}: {
  readonly label: string;
  readonly state: NonNullable<
    MatchupSimulationResult["simulation"]
  >["combatants"]["a"];
}) {
  return (
    <div className="bg-accent/60 rounded-xl p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <h4 className="font-semibold">{state.pokemon.name}</h4>
      <p className="text-muted-foreground mt-2 text-xs">
        Atk {state.pokemon.stats.attack.toFixed(1)} · Def{" "}
        {state.pokemon.stats.defense.toFixed(1)} · HP {state.pokemon.stats.hp}
      </p>
      <p className="mt-1 text-xs">
        {state.pokemon.fastMove.name} ·{" "}
        {state.pokemon.chargedMoves.map(({ name }) => name).join(" · ")}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">
        Energía {state.energy} · Cargados {state.chargedMovesUsed} · Escudos{" "}
        {state.shieldsUsed}
      </p>
    </div>
  );
}
