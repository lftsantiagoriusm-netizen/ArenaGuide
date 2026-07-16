import type { BattleMove } from "@/features/battle-simulator/domain/types";
import {
  competitiveChargedMoves,
  competitiveFastMoves,
  competitiveMoves,
} from "../data/competitive-moves.data";
import type {
  CompetitiveChargedMove,
  CompetitiveFastMove,
  CompetitiveMove,
  ResolveCompetitiveMoveResult,
} from "./competitive-move-types";

const movesById = new Map<string, CompetitiveMove>(
  competitiveMoves.map((move) => [move.id, move]),
);

export const getCompetitiveMoveById = (
  id: string,
): CompetitiveMove | undefined => movesById.get(id.trim().toLowerCase());

export const resolveCompetitiveMove = (
  id: string,
): ResolveCompetitiveMoveResult<CompetitiveMove> => {
  const move = getCompetitiveMoveById(id);
  return move
    ? { ok: true, move }
    : {
        ok: false,
        error: {
          code: "move-not-found",
          moveId: id,
          message: `No existen datos competitivos para el movimiento ${id}.`,
        },
      };
};

export const resolveCompetitiveFastMove = (
  id: string,
): ResolveCompetitiveMoveResult<CompetitiveFastMove> => {
  const result = resolveCompetitiveMove(id);
  if (!result.ok) return result;
  return result.move.category === "fast"
    ? { ok: true, move: result.move }
    : {
        ok: false,
        error: {
          code: "category-mismatch",
          moveId: id,
          message: `${result.move.name} no es un movimiento rápido.`,
        },
      };
};

export const resolveCompetitiveChargedMove = (
  id: string,
): ResolveCompetitiveMoveResult<CompetitiveChargedMove> => {
  const result = resolveCompetitiveMove(id);
  if (!result.ok) return result;
  return result.move.category === "charged"
    ? { ok: true, move: result.move }
    : {
        ok: false,
        error: {
          code: "category-mismatch",
          moveId: id,
          message: `${result.move.name} no es un movimiento cargado.`,
        },
      };
};

export const adaptCompetitiveFastMoveToBattleMove = (
  move: CompetitiveFastMove,
): BattleMove => ({
  id: move.id,
  name: move.name,
  type: move.type,
  kind: "fast",
  power: move.power,
  energyDelta: move.energyGain,
  turns: move.turns,
});

export const adaptCompetitiveChargedMoveToBattleMove = (
  move: CompetitiveChargedMove,
): BattleMove => ({
  id: move.id,
  name: move.name,
  type: move.type,
  kind: "charged",
  power: move.power,
  energyDelta: -move.energyCost,
  turns: 0,
});

export const getAllCompetitiveFastMoves = (): readonly CompetitiveFastMove[] =>
  competitiveFastMoves;
export const getAllCompetitiveChargedMoves =
  (): readonly CompetitiveChargedMove[] => competitiveChargedMoves;
