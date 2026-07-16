import { getCompetitiveMoveById } from "../index";

interface Props {
  readonly fastMoveId: string;
  readonly chargedMoveIds: readonly [string, string];
}

export function CompetitiveMoveSummary({ fastMoveId, chargedMoveIds }: Props) {
  const fast = getCompetitiveMoveById(fastMoveId);
  const charged = chargedMoveIds.map(getCompetitiveMoveById);
  if (!fast && charged.every((move) => move === undefined)) return null;

  return (
    <div
      className="text-muted-foreground rounded-xl border border-dashed px-3 py-2 text-xs leading-5"
      aria-live="polite"
    >
      {fast?.category === "fast" ? (
        <p>
          {fast.name}: {fast.power} poder · +{fast.energyGain} energía ·{" "}
          {fast.turns} turnos
        </p>
      ) : null}
      {charged.map((move) =>
        move?.category === "charged" ? (
          <p key={move.id}>
            {move.name}: {move.power} poder · {move.energyCost} energía
            {move.verificationStatus === "source-conflict"
              ? " · fuente con discrepancia documentada"
              : ""}
          </p>
        ) : null,
      )}
    </div>
  );
}
