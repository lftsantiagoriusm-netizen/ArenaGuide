import type { BattleStat } from "./stat-stages";

export type CompetitiveMoveEffectDataVersion =
  `arena-competitive-move-effects-v${number}`;
export type MoveEffectTarget = "self" | "opponent";
export type MoveEffectSupport =
  "deterministic" | "probabilistic" | "unsupported";

export interface CompetitiveMoveEffect {
  readonly moveId: string;
  readonly target: MoveEffectTarget;
  readonly stat: BattleStat;
  readonly stages: number;
  readonly probability: number;
  readonly support: MoveEffectSupport;
}

export interface CompetitiveMoveEffectMetadata {
  readonly schemaVersion: 1;
  readonly datasetVersion: CompetitiveMoveEffectDataVersion;
  readonly sourceRevision: string;
  readonly updatedAt: string;
  readonly status: "verified";
}
