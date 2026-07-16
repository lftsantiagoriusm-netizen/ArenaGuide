import type { League } from "@/features/pokedex";
import type {
  BattleBuild,
  SimulationResult,
} from "@/features/battle-simulator";
import type {
  CompetitiveDatasetVersion,
  CompetitiveMoveDataVersion,
  CompetitiveMoveEffectDataVersion,
} from "@/features/competitive-data";

export type MetaDatasetVersion = "arena-meta-fixture-v1";
export type MatchupClassification =
  | "dominant"
  | "favorable"
  | "close"
  | "unfavorable"
  | "very-unfavorable"
  | "draw"
  | "invalid";
export type MatchupSortOption =
  "best" | "worst" | "name" | "remaining-hp" | "duration" | "weight";
export type MatchupFilter =
  | "all"
  | "wins"
  | "losses"
  | "draws"
  | "favorable"
  | "close"
  | "unfavorable"
  | "invalid";

export interface MetaEntry {
  readonly id: string;
  readonly speciesId: string;
  readonly formId: string;
  readonly name: string;
  readonly league: League;
  readonly build: BattleBuild;
  readonly weight: number;
  readonly category?: string;
  readonly sourceVersion: MetaDatasetVersion;
}
export interface MetaDataset {
  readonly version: MetaDatasetVersion;
  readonly label: string;
  readonly provisional: true;
  readonly entries: readonly MetaEntry[];
}
export interface MatchupSimulationRequest {
  readonly runId: number;
  readonly analyzedBuild: BattleBuild;
  readonly league: League;
  readonly shields: 0 | 1 | 2;
  readonly opponents: readonly MetaEntry[];
  readonly maxTurns?: number;
}
export interface MatchupFailure {
  readonly code: "invalid-analyzed-build" | "invalid-opponent" | "stale-run";
  readonly message: string;
}
export interface MatchupSimulationResult {
  readonly opponent: MetaEntry;
  readonly simulation: SimulationResult | null;
  readonly classification: MatchupClassification;
  readonly score: number;
  readonly failure: MatchupFailure | null;
}
export interface MatchupMatrixSummary {
  readonly total: number;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly invalid: number;
  readonly winRate: number;
  readonly classifications: Readonly<Record<MatchupClassification, number>>;
}
export interface MatchupMatrix {
  readonly runId: number;
  readonly league: League;
  readonly shields: 0 | 1 | 2;
  readonly results: readonly MatchupSimulationResult[];
  readonly summary: MatchupMatrixSummary;
  readonly stale: boolean;
}
export interface BatchSimulationProgress {
  readonly runId: number;
  readonly completed: number;
  readonly total: number;
  readonly percentage: number;
}
export interface MatrixSettings {
  readonly version: 1;
  readonly competitiveDataVersion: CompetitiveDatasetVersion;
  readonly competitiveMoveDataVersion: CompetitiveMoveDataVersion;
  readonly competitiveMoveEffectDataVersion: CompetitiveMoveEffectDataVersion;
  readonly build: BattleBuild;
  readonly league: League;
  readonly shields: 0 | 1 | 2;
  readonly filter: MatchupFilter;
  readonly sort: MatchupSortOption;
}
