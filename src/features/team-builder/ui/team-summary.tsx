import { CheckCircle2, CircleAlert } from "lucide-react";
import { getPokemonById } from "@/features/pokedex";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Team, ValidationIssue } from "../domain/types";

interface TeamSummaryProps {
  readonly team: Team;
  readonly issues: readonly ValidationIssue[];
  readonly isValid: boolean;
}

export function TeamSummary({ team, issues, isValid }: TeamSummaryProps) {
  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <div className="flex items-center gap-3">
          {isValid ? (
            <CheckCircle2 className="size-5 text-green-600" />
          ) : (
            <CircleAlert className="size-5 text-amber-600" />
          )}
          <div>
            <h2 className="font-semibold">Resumen del equipo</h2>
            <p className="text-muted-foreground text-sm">
              {isValid
                ? "Equipo listo para guardar"
                : `${issues.length} ${issues.length === 1 ? "validación pendiente" : "validaciones pendientes"}`}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {team.slots.map(({ id, build }) => {
          const pokemon = getPokemonById(build.pokemonId);
          const fastMove = pokemon?.learnset.fastMoves.find(
            (move) => move.id === build.fastMoveId,
          )?.name;
          const chargedMoves = pokemon?.learnset.chargedMoves
            .filter(
              (move) =>
                move.id === build.chargedMove1Id ||
                move.id === build.chargedMove2Id,
            )
            .map(({ name }) => name);
          return (
            <div
              key={id}
              className="border-border bg-background rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Slot {id}</p>
                  <h3 className="mt-0.5 font-semibold">
                    {pokemon?.name ?? "Sin configurar"}
                  </h3>
                </div>
                {pokemon ? (
                  <div className="flex gap-1">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className="bg-accent rounded-full px-2 py-1 text-[11px] font-medium capitalize"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              {pokemon ? (
                <div className="text-muted-foreground mt-3 space-y-1 text-xs leading-5">
                  <p>
                    <span className="text-foreground">IV:</span>{" "}
                    {build.attackIv}/{build.defenseIv}/{build.staminaIv} · Nivel{" "}
                    {build.level}
                  </p>
                  <p>
                    <span className="text-foreground">Rápido:</span>{" "}
                    {fastMove ?? "Pendiente"}
                  </p>
                  <p>
                    <span className="text-foreground">Cargados:</span>{" "}
                    {chargedMoves?.join(" · ") || "Pendientes"}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
