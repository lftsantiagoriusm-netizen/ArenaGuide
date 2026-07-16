import { getPokemonById } from "@/features/pokedex";
import type { Team, ValidationIssue } from "@/features/team-builder";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TeamPreview({
  team,
  issues,
}: {
  readonly team: Team;
  readonly issues: readonly ValidationIssue[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">Equipo cargado</h2>
          <span
            className={
              issues.length
                ? "text-destructive text-xs"
                : "text-xs text-emerald-600"
            }
          >
            {issues.length ? "Configuración inválida" : "Listo para analizar"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {team.slots.map(({ id, build }) => (
            <div key={id} className="bg-accent/50 rounded-xl p-3">
              <p className="text-muted-foreground text-xs">slot{id}</p>
              <p className="font-medium">
                {getPokemonById(build.pokemonId)?.name ?? "Sin seleccionar"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Nivel {build.level} · {build.attackIv}/{build.defenseIv}/
                {build.staminaIv}
              </p>
            </div>
          ))}
        </div>
        {issues.length ? (
          <ul className="text-destructive space-y-1 text-sm">
            {issues.slice(0, 5).map((issue, index) => (
              <li key={`${issue.code}-${issue.slotId ?? 0}-${index}`}>
                {issue.message}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
