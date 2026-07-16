import type { BaseStats, League } from "@/features/pokedex";
import type { PokemonBuild } from "@/features/team-builder";

export type CompetitiveDatasetVersion = `arena-competitive-data-v${number}`;
export type CompetitiveDataStatus = "consolidated" | "provisional";

export interface CompetitiveDataMetadata {
  readonly schemaVersion: 1;
  readonly datasetVersion: CompetitiveDatasetVersion;
  readonly gameMasterVersion: "local-reference-2026-07-16";
  readonly updatedAt: "2026-07-16";
  readonly sourceLabel: "ArenaGuide local reference dataset";
  readonly status: CompetitiveDataStatus;
}

export interface EffectiveCompetitiveStats {
  readonly attack: number;
  readonly defense: number;
  readonly stamina: number;
  readonly hp: number;
  readonly cp: number;
  readonly levelMultiplier: number;
}

export interface LeagueRules {
  readonly league: League;
  readonly cpLimit: number | null;
  readonly label: string;
}

export type CompetitiveBuildErrorCode =
  | "species-not-found"
  | "form-not-found"
  | "level-not-supported"
  | "invalid-iv"
  | "illegal-move"
  | "duplicate-charged-move"
  | "over-cp-limit"
  | "species-incompatible";

export interface CompetitiveBuildError {
  readonly code: CompetitiveBuildErrorCode;
  readonly message: string;
  readonly field: keyof PokemonBuild;
  readonly cp?: number;
  readonly cpLimit?: number;
}

export interface ResolvedCompetitiveBuild {
  readonly speciesId: string;
  readonly formId: string;
  readonly level: number;
  readonly ivs: Readonly<{ attack: number; defense: number; stamina: number }>;
  readonly baseStats: BaseStats;
  readonly stats: EffectiveCompetitiveStats;
  readonly league: League;
  readonly leagueRules: LeagueRules;
  readonly dataVersion: CompetitiveDatasetVersion;
  readonly dataStatus: CompetitiveDataStatus;
}

export type ResolveBuildResult =
  | { readonly ok: true; readonly build: ResolvedCompetitiveBuild }
  | { readonly ok: false; readonly error: CompetitiveBuildError };
