import type { League } from "@/features/pokedex";

export interface PokemonBuild {
  readonly pokemonId: string;
  readonly formId: string;
  readonly league: League;
  readonly attackIv: number;
  readonly defenseIv: number;
  readonly staminaIv: number;
  readonly level: number;
  readonly fastMoveId: string;
  readonly chargedMove1Id: string;
  readonly chargedMove2Id: string;
}

export type TeamSlotId = 1 | 2 | 3;

export interface TeamSlot {
  readonly id: TeamSlotId;
  readonly build: PokemonBuild;
}

export interface Team {
  readonly version: 1;
  readonly slots: readonly [TeamSlot, TeamSlot, TeamSlot];
}

export type ValidationIssueCode =
  | "required"
  | "invalid-form"
  | "invalid-iv"
  | "invalid-level"
  | "illegal-move"
  | "duplicate-charged-move"
  | "ineligible-league"
  | "duplicate-pokemon"
  | "incomplete-team"
  | "cp-over-limit"
  | "competitive-data";

export type BuildField = keyof PokemonBuild | "team";

export interface ValidationIssue {
  readonly code: ValidationIssueCode;
  readonly field: BuildField;
  readonly message: string;
  readonly slotId?: TeamSlotId;
}
