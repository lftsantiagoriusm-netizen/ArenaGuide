import type { TeamCoverageRow } from "../domain/types";

const labels = {
  covered: "Cubierto",
  uncertain: "Incierto",
  critical: "Crítico",
  invalid: "Inválido",
  dominant: "Dominante",
  favorable: "Favorable",
  close: "Cerrado",
  unfavorable: "Desfavorable",
  "very-unfavorable": "Muy desfavorable",
  draw: "Empate",
} as const;

export function CoverageRowCard({ row }: { readonly row: TeamCoverageRow }) {
  return (
    <details className="border-border bg-card rounded-2xl border p-4 shadow-sm">
      <summary className="cursor-pointer list-none">
        <div className="grid items-center gap-3 md:grid-cols-[1.3fr_repeat(3,1fr)_0.8fr_0.8fr]">
          <div>
            <p className="font-medium">{row.opponent.name}</p>
            <p className="text-muted-foreground text-xs">
              {row.opponent.category ?? "meta"}
            </p>
          </div>
          {row.members.map((member) => (
            <div
              key={member.slotId}
              className="flex justify-between gap-2 md:block"
            >
              <span className="text-muted-foreground text-xs md:hidden">
                slot{member.slotId}
              </span>
              <span className="text-sm">{labels[member.classification]}</span>
            </div>
          ))}
          <p className="text-sm">
            {row.bestSlotId ? `slot${row.bestSlotId}` : "—"}
          </p>
          <div>
            <span className="text-sm font-medium">
              {labels[row.classification]}
            </span>
            {row.incomplete ? (
              <span className="ml-2 text-xs text-amber-600">Incompleto</span>
            ) : null}
          </div>
        </div>
      </summary>
      <div className="border-border mt-4 grid gap-3 border-t pt-4 md:grid-cols-3">
        {row.members.map((member) => (
          <div
            key={member.slotId}
            className="bg-accent/40 rounded-xl p-3 text-xs"
          >
            <p className="font-medium">
              slot{member.slotId} · {labels[member.classification]}
            </p>
            <p className="text-muted-foreground mt-2">
              Score {member.score.toFixed(1)} · HP {member.remainingHp ?? "—"}%
              · Energía {member.remainingEnergy ?? "—"} · Escudos{" "}
              {member.remainingShields ?? "—"} · Turnos {member.turns ?? "—"}
            </p>
            {member.error ? (
              <p className="text-destructive mt-2">{member.error}</p>
            ) : null}
          </div>
        ))}
      </div>
    </details>
  );
}
