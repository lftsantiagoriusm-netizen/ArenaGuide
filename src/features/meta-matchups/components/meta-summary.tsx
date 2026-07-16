import { Card } from "@/components/ui/card";
import type { MatchupMatrixSummary } from "../domain/types";

export function MetaSummary({
  summary,
}: {
  readonly summary: MatchupMatrixSummary;
}) {
  const metrics = [
    ["Combates", summary.total],
    ["Victorias", summary.wins],
    ["Derrotas", summary.losses],
    ["Empates", summary.draws],
    ["Inválidos", summary.invalid],
    ["Win rate", `${summary.winRate}%`],
  ] as const;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {metrics.map(([label, value]) => (
        <Card key={label} className="p-4">
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
        </Card>
      ))}
    </div>
  );
}
